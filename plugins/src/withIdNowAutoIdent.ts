const {
  withInfoPlist,
  withDangerousMod,
  withPlugins,
  withAndroidManifest,
} = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

async function readFile(path) {
  return fs.promises.readFile(path, "utf8");
}

async function saveFile(path, content) {
  return fs.promises.writeFile(path, content, "utf8");
}

function manageAndroidManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const permisions = androidManifest["uses-permission"];
    if (permisions) {
      if (
        permisions.find(
          (per) => per.$["android:name"] !== "android.permission.INTERNET",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.INTERNET",
          },
        });
      }
      if (
        permisions.find(
          (per) => per.$["android:name"] !== "android.permission.CAMERA",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.CAMERA",
          },
        });
      }
      if (
        permisions.find(
          (per) =>
            per.$["android:name"] !== "android.permission.ACCESS_NETWORK_STATE",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.ACCESS_NETWORK_STATE",
          },
        });
      }
      if (
        permisions.find(
          (per) => per.$["android:name"] !== "android.permission.FLASHLIGHT",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.FLASHLIGHT",
          },
        });
      }
      if (
        permisions.find(
          (per) =>
            per.$["android:name"] !== "android.permission.FOREGROUND_SERVICE",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.FOREGROUND_SERVICE",
          },
        });
      }
      if (
        permisions.find(
          (per) =>
            per.$["android:name"] !== "android.permission.READ_MEDIA_IMAGES",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.READ_MEDIA_IMAGES",
          },
        });
      }
      if (
        permisions.find(
          (per) =>
            per.$["android:name"] !== "android.permission.POST_NOTIFICATIONS",
        )
      ) {
        androidManifest["uses-permission"].push({
          $: {
            "android:name": "android.permission.POST_NOTIFICATIONS",
          },
        });
      }
    }

    const features = androidManifest["uses-feature"];
    if (!features) {
      androidManifest["uses-feature"] = [
        {
          $: {
            "android:name": "android.hardware.camera",
            "android:required": "true",
          },
        },
        {
          $: {
            "android:name": "android.hardware.camera.autofocus",
            "android:required": "false",
          },
        },
        {
          $: {
            "android:glEsVersion": "0x00020000",
            "android:required": "true",
          },
        },
      ];
    }

    return config;
  });
}

/*
const withMavenArtifactory = contents.replace(
  "allprojects {",
  'allprojects {\n  repositories {\n   maven { url "https://raw.githubusercontent.com/idnow/de.idnow.android.sdk/master" }',
);*/

const mavenArtifactory = `allprojects {   
    repositories { 
        maven { url "https://raw.githubusercontent.com/idnow/de.idnow.android.sdk/master" }
      `;

function withMavenArtifactory(config) {
  return withPlugins(config, [
    (config) => {
      return withDangerousMod(config, [
        "android",
        async (config) => {
          const file = path.join(
            config.modRequest.platformProjectRoot,
            "build.gradle",
          );

          const contents = await readFile(file);
          const newContents = contents.replace(
            "allprojects {\n    repositories {",
            mavenArtifactory,
          );
          /*
           * Now re-adds the content
           */
          await saveFile(file, newContents);
          return config;
        },
      ]);
    },
  ]);
}

function manageBuildGradle(config) {
  return withPlugins(config, [
    (config) => {
      return withDangerousMod(config, [
        "android",
        async (config) => {
          const file = path.join(
            config.modRequest.platformProjectRoot,
            "app/build.gradle",
          );
          const contents = await readFile(file);

          if (contents.includes("renderscriptTargetApi 21")) {
            return config;
          }
          const newContents = contents.replace(
            "defaultConfig {",
            `defaultConfig {
        renderscriptTargetApi 21
        renderscriptSupportModeEnabled true
        vectorDrawables.useSupportLibrary = true`,
          );
          await saveFile(file, newContents);
          return config;
        },
      ]);
    },
  ]);
}

function setInfoPlistConfig(infoPlist) {
  if (!infoPlist.NSCameraUsageDescription)
    infoPlist.NSCameraUsageDescription =
      "Allow Camera Access for Video Identification";
  if (!infoPlist.NSPhotoLibraryUsageDescription)
    infoPlist.NSPhotoLibraryUsageDescription =
      "Allow Library Access for Video Identification";

  return infoPlist;
}

function manageIosInfoPlist(config) {
  return withInfoPlist(config, (config) => {
    config.modResults = setInfoPlistConfig(config.modResults);
    return config;
  });
}

function withXS2APodfile(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, "Podfile");
      const contents = await readFile(file);

      if (contents.includes("pod 'XS2AiOSNetService'")) {
        return config;
      }

      const newContents = contents.replace(
        /target ['"](.+?)['"] do/,
        `target '$1' do\n  pod 'XS2AiOSNetService', :git => 'https://github.com/FinTecSystems/xs2a-ios-netservice.git', :branch => 'master'`,
      );

      await saveFile(file, newContents);
      return config;
    },
  ]);
}

module.exports = (config, data) =>
  withPlugins(config, [
    [manageAndroidManifest, data],
    [manageBuildGradle, data],
    [withMavenArtifactory, data],
    [manageIosInfoPlist, data],
    [withXS2APodfile, data],
  ]);
