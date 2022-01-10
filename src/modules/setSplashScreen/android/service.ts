import { getHexColor } from '../../../services/color.processing';
import { applyPatch, copyFile, readFile, replaceInFile } from '../../../services/file.processing';
import { join } from 'path';
import { ANDROID_MAIN_RES_PATH } from '../../config';
import { generateResizedAssets } from '../../../services/image.processing';
import { config } from './config';
import { EResizeMode } from '../../../services/type';

export const addAndroidSplashScreen = async (
  imageSource: string,
  backgroundColor: string,
  resizeMode?: EResizeMode
) => {
  try {
    addReactNativeSplashScreen(backgroundColor, resizeMode);
    await generateAndroidSplashImages(imageSource);
  } catch (err) {
    console.log(err);
  }
};

const addLaunchScreenBackgroundColor = (backgroundColor: string) => {
  replaceInFile(
    join(__dirname, '../../../../templates/android/values/colors-splash.xml'),
    `${ANDROID_MAIN_RES_PATH}/values/colors-splash.xml`,
    [
      {
        oldContent: /{{splashprimary}}/g,
        newContent: `${getHexColor(backgroundColor)}`,
      },
    ]
  );
};

const addReactNativeSplashScreen = (
  backgroundColor: string,
  resizeMode: EResizeMode = EResizeMode.CONTAIN
) => {
  addLaunchScreenBackgroundColor(backgroundColor);

  copyFile(
    join(__dirname, '../../../../templates/android/drawable/splashscreen.xml'),
    `${ANDROID_MAIN_RES_PATH}/drawable/splashscreen.xml`
  );
  copyFile(
    join(__dirname, `../../../../templates/android/layout/launch_screen.${resizeMode}.xml`),
    `${ANDROID_MAIN_RES_PATH}/layout/launch_screen.xml`
  );
  applyPatch(`${ANDROID_MAIN_RES_PATH}/values/styles.xml`, {
    pattern: /^.*<resources>.*[\r\n]/g,
    patch: readFile(join(__dirname, '../../../../templates/android/values/styles-splash.xml')),
  });

};

const generateAndroidSplashImages = (imageSource: string) =>
  Promise.all(
    config.androidSplashImages.map(({ size, density }) =>
      generateResizedAssets(
        imageSource,
        `${ANDROID_MAIN_RES_PATH}/drawable-${density}/splash_image.png`,
        size,
        size,
        {
          fit: 'inside',
        }
      )
    )
  );
