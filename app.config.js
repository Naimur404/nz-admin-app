import 'dotenv/config';

export default {
  expo: {
    name: "MyNZ Admin",
    slug: "mynz-admin-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/mynztrip-white.png",
    scheme: "mynzadminapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mynztrip.admin",
    },
    android: {
      package: "com.mynztrip.admin",
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: "#1e40af",
        foregroundImage: "./assets/images/mynztrip-white.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/mynztrip-white.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/mynztrip-white.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/mynztrip-white.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1e40af",
          dark: {
            backgroundColor: "#1e40af",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      apiBaseUrl: process.env.API_BASE_URL || "https://nz-b2b-api-admin.laravel.cloud/api",
    },
  },
};