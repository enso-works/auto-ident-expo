import { InfoPlist, withInfoPlist } from "@expo/config-plugins";

const {
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
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    const permisions = androidManifest["uses-permission"];
    if (permisions) {
      if (
        permisions.find(
          (per) => per["$"]["android:name"] !== "android.permission.INTERNET",
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
          (per) => per["$"]["android:name"] !== "android.permission.CAMERA",
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
            per["$"]["android:name"] !==
            "android.permission.ACCESS_NETWORK_STATE",
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
          (per) => per["$"]["android:name"] !== "android.permission.FLASHLIGHT",
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
            per["$"]["android:name"] !==
            "android.permission.FOREGROUND_SERVICE",
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
            per["$"]["android:name"] !== "android.permission.READ_MEDIA_IMAGES",
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
            per["$"]["android:name"] !==
            "android.permission.POST_NOTIFICATIONS",
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
  return config;
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
  config = withPlugins(config, [
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
          } else {
            const newContents = contents.replace(
              "defaultConfig {",
              `defaultConfig {
        renderscriptTargetApi 21
        renderscriptSupportModeEnabled true
        vectorDrawables.useSupportLibrary = true`,
            );
            await saveFile(file, newContents);
            return config;
          }
        },
      ]);
    },
  ]);

  return config;
}

function setInfoPlistConfig(infoPlist: InfoPlist): InfoPlist {
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

declare let module: any;
module.exports = (config, data) =>
  withPlugins(config, [
    [manageAndroidManifest, data],
    [manageBuildGradle, data],
    [withMavenArtifactory, data],
    [manageIosInfoPlist, data],
  ]);
