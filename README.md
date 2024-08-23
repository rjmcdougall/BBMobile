# BBMobile
# To install the android app on monitor
# Create assets directory:
mkdir ./android/app/src/main/assets/
# Create bundle output file (I tried with just index.android first and it didn't work)
touch ./android/app/src/main/assets/index.android.bundle
# Bundle app
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
# Create Android debug build
cd android && ./gradlew assembleDebug
#  instsll on phone
cd ..
adb install  ./android/app/build/outputs/apk/debug/app-debug.apk
 