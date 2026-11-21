import java.util.Properties

// Google Maps key from android/local.properties (git-ignored); empty → the app uses the mock map.
val googleMapsApiKey: String = Properties().run {
    rootProject.file("local.properties").takeIf { it.exists() }?.inputStream()?.use { load(it) }
    getProperty("GOOGLE_MAPS_API_KEY", "")
}

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "sa.jazlah.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "sa.jazlah.app"
        minSdk = 26
        manifestPlaceholders["googleMapsApiKey"] = googleMapsApiKey
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    buildFeatures {
        resValues = true
    }

    // flutter run --flavor <dev|staging|prod> -t lib/main_<flavor>.dart
    flavorDimensions += "env"
    productFlavors {
        create("dev") {
            dimension = "env"
            applicationIdSuffix = ".dev"
            resValue("string", "app_name", "JAZLA Dev")
        }
        create("staging") {
            dimension = "env"
            applicationIdSuffix = ".staging"
            resValue("string", "app_name", "JAZLA Staging")
        }
        create("prod") {
            dimension = "env"
            resValue("string", "app_name", "جزلة")
        }
    }

    buildTypes {
        release {
            // shortcut: debug signing until the release keystore exists (HRD release task).
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
