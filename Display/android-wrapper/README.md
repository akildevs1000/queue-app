trigger to open tv settings on tvh ttp://192.168.3.245:8000/tv-settings

npx expo prebuild && cd android && ./gradlew clean && ./gradlew assembleRelease


important for http and ws
always add this to AndroidManifest 
<application android:usesCleartextTraffic="true" />Your existing code</application>
