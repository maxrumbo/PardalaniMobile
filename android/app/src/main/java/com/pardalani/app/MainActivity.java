package com.pardalani.app;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.view.View;
import android.view.Window;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private static final int SPEECH_REQUEST_CODE = 1001;
    private SpeechRecognizer speechRecognizer;
    private TextToSpeech tts;
    private boolean ttsReady = false;
    private String pendingSpeakText = null;
    private String pendingSpeakLang = null;
    private long lastBackPressTime = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView.setWebContentsDebuggingEnabled(true);

        // Check and request runtime permissions (Audio, GPS, Camera)
        ArrayList<String> perms = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            perms.add(Manifest.permission.RECORD_AUDIO);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            perms.add(Manifest.permission.ACCESS_FINE_LOCATION);
            perms.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            perms.add(Manifest.permission.CAMERA);
        }
        if (!perms.isEmpty()) {
            ActivityCompat.requestPermissions(this, perms.toArray(new String[0]), 100);
        }

        // Initialize Android TextToSpeech
        initTTS();

        WebView webView = getBridge().getWebView();

        // 1. Native TextToSpeech Interface
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void speak(String text, String lang) {
                runOnUiThread(() -> speakInternal(text, lang));
            }

            @JavascriptInterface
            public void stop() {
                runOnUiThread(() -> {
                    if (tts != null) {
                        tts.stop();
                    }
                });
            }

            @JavascriptInterface
            public boolean isAvailable() {
                return true;
            }
        }, "AndroidTTS");

        // 2. Native Speech Recognizer Interface (Microphone) - Silent In-Process (No Toast, Direct Typing)
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void startListening(String lang) {
                runOnUiThread(() -> {
                    try {
                        if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                            ActivityCompat.requestPermissions(MainActivity.this, new String[]{
                                Manifest.permission.RECORD_AUDIO
                            }, 100);
                            return;
                        }

                        if (speechRecognizer != null) {
                            try {
                                speechRecognizer.destroy();
                            } catch (Exception ignored) {}
                            speechRecognizer = null;
                        }

                        if (SpeechRecognizer.isRecognitionAvailable(MainActivity.this)) {
                            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(MainActivity.this);
                            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en".equalsIgnoreCase(lang) ? "en-US" : "id-ID");
                            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);

                            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                                @Override
                                public void onReadyForSpeech(Bundle params) {
                                    runOnUiThread(() -> {
                                        if (getBridge() != null && getBridge().getWebView() != null) {
                                            getBridge().getWebView().evaluateJavascript("window.onAndroidSpeechStart && window.onAndroidSpeechStart()", null);
                                        }
                                    });
                                }

                                @Override
                                public void onBeginningOfSpeech() {}

                                @Override
                                public void onRmsChanged(float rmsdB) {}

                                @Override
                                public void onBufferReceived(byte[] buffer) {}

                                @Override
                                public void onEndOfSpeech() {
                                    runOnUiThread(() -> {
                                        if (getBridge() != null && getBridge().getWebView() != null) {
                                            getBridge().getWebView().evaluateJavascript("window.onAndroidSpeechEnd && window.onAndroidSpeechEnd()", null);
                                        }
                                    });
                                }

                                @Override
                                public void onError(int error) {
                                    runOnUiThread(() -> {
                                        if (getBridge() != null && getBridge().getWebView() != null) {
                                            getBridge().getWebView().evaluateJavascript("window.onAndroidSpeechEnd && window.onAndroidSpeechEnd()", null);
                                        }
                                    });
                                }

                                @Override
                                public void onResults(Bundle results) {
                                    if (results != null) {
                                        ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                                        if (matches != null && !matches.isEmpty()) {
                                            String text = matches.get(0);
                                            String safe = text.replace("\\", "\\\\").replace("'", "\\'");
                                            runOnUiThread(() -> {
                                                if (getBridge() != null && getBridge().getWebView() != null) {
                                                    getBridge().getWebView().evaluateJavascript("window.onAndroidSpeechResult && window.onAndroidSpeechResult('" + safe + "')", null);
                                                }
                                            });
                                        }
                                    }
                                }

                                @Override
                                public void onPartialResults(Bundle partialResults) {
                                    if (partialResults != null) {
                                        ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                                        if (matches != null && !matches.isEmpty()) {
                                            String text = matches.get(0);
                                            String safe = text.replace("\\", "\\\\").replace("'", "\\'");
                                            runOnUiThread(() -> {
                                                if (getBridge() != null && getBridge().getWebView() != null) {
                                                    getBridge().getWebView().evaluateJavascript("window.onAndroidSpeechPartial && window.onAndroidSpeechPartial('" + safe + "')", null);
                                                }
                                            });
                                        }
                                    }
                                }

                                @Override
                                public void onEvent(int eventType, Bundle params) {}
                            });

                            speechRecognizer.startListening(intent);
                        } else {
                            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en".equalsIgnoreCase(lang) ? "en-US" : "id-ID");
                            startActivityForResult(intent, SPEECH_REQUEST_CODE);
                        }
                    } catch (Exception e) {
                        try {
                            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en".equalsIgnoreCase(lang) ? "en-US" : "id-ID");
                            startActivityForResult(intent, SPEECH_REQUEST_CODE);
                        } catch (Exception ignored) {}
                    }
                });
            }

            @JavascriptInterface
            public void stopListening() {
                runOnUiThread(() -> {
                    if (speechRecognizer != null) {
                        try {
                            speechRecognizer.stopListening();
                        } catch (Exception ignored) {}
                    }
                });
            }
        }, "AndroidSpeech");

        // 3. Native Location Interface
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public String getLocation() {
                try {
                    LocationManager lm = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
                    if (ActivityCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                        ActivityCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                        Location loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                        if (loc == null) {
                            loc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                        }
                        if (loc != null) {
                            return loc.getLatitude() + "," + loc.getLongitude();
                        }
                    }
                } catch (Exception ignored) {}
                return "";
            }
        }, "AndroidLocation");

        // 4. Native Share Interface (Android Intent Share Sheet)
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void share(String title, String text) {
                runOnUiThread(() -> {
                    try {
                        Intent sendIntent = new Intent();
                        sendIntent.setAction(Intent.ACTION_SEND);
                        sendIntent.putExtra(Intent.EXTRA_TITLE, title);
                        sendIntent.putExtra(Intent.EXTRA_SUBJECT, title);
                        sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                        sendIntent.setType("text/plain");
                        Intent shareIntent = Intent.createChooser(sendIntent, title);
                        shareIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(shareIntent);
                    } catch (Exception ignored) {}
                });
            }
        }, "AndroidShare");

        // 5. Native Haptic Feedback Interface
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void vibrate(int ms) {
                runOnUiThread(() -> {
                    try {
                        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
                        if (v != null && v.hasVibrator()) {
                            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                                v.vibrate(VibrationEffect.createOneShot(Math.min(ms, 200), VibrationEffect.DEFAULT_AMPLITUDE));
                            } else {
                                v.vibrate(Math.min(ms, 200));
                            }
                        }
                    } catch (Exception ignored) {}
                });
            }
        }, "AndroidHaptic");

        // 6. Native Status Bar & Navigation Bar Theme
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void setStatusBarTheme(boolean isDark) {
                runOnUiThread(() -> {
                    try {
                        Window window = getWindow();
                        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                        int bgColor = isDark ? 0xFF11121D : 0xFFF7F7F2;
                        window.setStatusBarColor(bgColor);
                        window.setNavigationBarColor(bgColor);

                        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
                            WindowInsetsController controller = window.getInsetsController();
                            if (controller != null) {
                                if (isDark) {
                                    controller.setSystemBarsAppearance(0, WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS);
                                } else {
                                    controller.setSystemBarsAppearance(
                                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
                                        WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
                                    );
                                }
                            }
                        } else if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                            View decor = window.getDecorView();
                            int flags = decor.getSystemUiVisibility();
                            if (isDark) {
                                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                            } else {
                                flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                            }
                            decor.setSystemUiVisibility(flags);
                        }
                    } catch (Exception ignored) {}
                });
            }
        }, "AndroidTheme");

        // 7. Native Actions (Direct WhatsApp, Google Maps, Phone Dialer)
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void openWhatsApp(String phone, String text) {
                runOnUiThread(() -> {
                    try {
                        String clean = phone != null ? phone.replaceAll("[^0-9]", "") : "";
                        if (clean.isEmpty()) {
                            // Direct share text to WhatsApp
                            Intent sendIntent = new Intent();
                            sendIntent.setAction(Intent.ACTION_SEND);
                            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                            sendIntent.setType("text/plain");
                            sendIntent.setPackage("com.whatsapp");
                            sendIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(sendIntent);
                            return;
                        }
                        if (clean.startsWith("0")) {
                            clean = "62" + clean.substring(1);
                        }
                        String url = "https://api.whatsapp.com/send?phone=" + clean + "&text=" + java.net.URLEncoder.encode(text, "UTF-8");
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (Exception e) {
                        try {
                            Intent sendIntent = new Intent();
                            sendIntent.setAction(Intent.ACTION_SEND);
                            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                            sendIntent.setType("text/plain");
                            Intent chooser = Intent.createChooser(sendIntent, "Bagikan WhatsApp");
                            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(chooser);
                        } catch (Exception ignored) {}
                    }
                });
            }

            @JavascriptInterface
            public void openMaps(String address) {
                runOnUiThread(() -> {
                    try {
                        Uri uri;
                        String trimmed = address != null ? address.trim() : "";
                        if (trimmed.startsWith("geo:") || trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
                            uri = Uri.parse(trimmed);
                        } else if (trimmed.matches("^-?\\d+(\\.\\d+)?,\\s*-?\\d+(\\.\\d+)?$")) {
                            uri = Uri.parse("geo:" + trimmed + "?q=" + trimmed);
                        } else {
                            uri = Uri.parse("geo:0,0?q=" + Uri.encode(trimmed));
                        }

                        try {
                            Intent gMapsIntent = new Intent(Intent.ACTION_VIEW, uri);
                            gMapsIntent.setPackage("com.google.android.apps.maps");
                            gMapsIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(gMapsIntent);
                        } catch (Exception e) {
                            Intent mapIntent = new Intent(Intent.ACTION_VIEW, uri);
                            mapIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(mapIntent);
                        }
                    } catch (Exception e) {
                        try {
                            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://maps.google.com/?q=" + Uri.encode(address)));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception ignored) {}
                    }
                });
            }

            @JavascriptInterface
            public void openDialer(String phone) {
                runOnUiThread(() -> {
                    try {
                        Intent intent = new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + phone));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (Exception ignored) {}
                });
            }
        }, "AndroidAction");
    }

    private void initTTS() {
        tts = new TextToSpeech(getApplicationContext(), status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                tts.setLanguage(new Locale("id", "ID"));
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override
                    public void onStart(String utteranceId) {
                        runOnUiThread(() -> {
                            if (getBridge() != null && getBridge().getWebView() != null) {
                                getBridge().getWebView().evaluateJavascript("window.onAndroidTTSStart && window.onAndroidTTSStart()", null);
                            }
                        });
                    }

                    @Override
                    public void onDone(String utteranceId) {
                        runOnUiThread(() -> {
                            if (getBridge() != null && getBridge().getWebView() != null) {
                                getBridge().getWebView().evaluateJavascript("window.onAndroidTTSEnd && window.onAndroidTTSEnd()", null);
                            }
                        });
                    }

                    @Override
                    public void onError(String utteranceId) {
                        runOnUiThread(() -> {
                            if (getBridge() != null && getBridge().getWebView() != null) {
                                getBridge().getWebView().evaluateJavascript("window.onAndroidTTSEnd && window.onAndroidTTSEnd()", null);
                            }
                        });
                    }
                });

                if (pendingSpeakText != null) {
                    speakInternal(pendingSpeakText, pendingSpeakLang);
                    pendingSpeakText = null;
                    pendingSpeakLang = null;
                }
            }
        });
    }

    private void speakInternal(String text, String lang) {
        if (tts != null && ttsReady) {
            if ("en".equalsIgnoreCase(lang) || "en-US".equalsIgnoreCase(lang)) {
                tts.setLanguage(Locale.US);
            } else {
                tts.setLanguage(new Locale("id", "ID"));
            }
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "PardalaniVoice");
        } else {
            pendingSpeakText = text;
            pendingSpeakLang = lang;
            if (tts == null) {
                initTTS();
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().evaluateJavascript(
                "(function() { return !!(window.handleAndroidBack && window.handleAndroidBack()); })()",
                result -> {
                    if (!"true".equals(result)) {
                        runOnUiThread(() -> {
                            long currentTime = System.currentTimeMillis();
                            if (currentTime - lastBackPressTime < 2000) {
                                finish();
                            } else {
                                lastBackPressTime = currentTime;
                                if (getBridge() != null && getBridge().getWebView() != null) {
                                    getBridge().getWebView().evaluateJavascript(
                                        "window.onAndroidBackToast && window.onAndroidBackToast()",
                                        null
                                    );
                                }
                            }
                        });
                    }
                }
            );
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SPEECH_REQUEST_CODE) {
            if (resultCode == RESULT_OK && data != null) {
                ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
                if (results != null && !results.isEmpty()) {
                    String spokenText = results.get(0);
                    String safeText = spokenText.replace("\\", "\\\\").replace("'", "\\'");
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().evaluateJavascript("window.onAndroidSpeechResult && window.onAndroidSpeechResult('" + safeText + "')", null);
                    }
                }
            }
        }
    }

    @Override
    public void onDestroy() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception ignored) {}
            speechRecognizer = null;
        }
        if (tts != null) {
            tts.stop();
            tts.shutdown();
        }
        super.onDestroy();
    }
}
