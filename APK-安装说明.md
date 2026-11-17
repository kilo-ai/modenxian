# 莫等闲 Android 安装包（1.0）

## 文件

- `莫等闲-1.0.apk`（约 3 MB，Android 5.1 及以上，已用自有证书签名）
- 完全离线：不用联网、不用梯子、不依赖浏览器，数据存在这台手机里

## 发给朋友 / 装到手机上

1. 把 APK 发过去：微信文件传输助手、QQ、网盘、数据线都行（微信里点开如果提示「不支持的文件类型」，选「用其他应用打开」，或让对方在文件管理里找到它）。
2. 手机上点这个文件 → 系统可能会提示「禁止安装未知应用」→ 点「设置」允许该来源（浏览器/微信/文件管理）→ 返回继续安装。
3. 装完桌面出现红底白「莫」的图标，名字叫「莫等闲」。

## 数据在哪

- 存在 App 自己的存储里，**卸载 App 就没了**；换手机不会同步；对方装的是同一个 App 但数据各自独立。
- 想让数据长期不丢：别卸载，或者以后做「导出备份」（还没做）。

## 以后怎么更新

- 用同一个签名重新打包，直接覆盖安装即可，**数据会保留**（签名证书不能换，换了就必须卸载重装、数据丢失）。
- 签名文件：`D:\android-tools\modenxian.keystore`，别名 `modenxian`，密码 `modenxian2026`（请自己另存一份，丢了就无法再升级覆盖）。
- 每次改版记得把 `android/app/build.gradle` 里的 `versionCode 1` 加 1、`versionName "1.0"` 改成新版本号。

## 重新打包（改了网页之后）

```bat
:: 1. 网页改完后同步到工程
copy /Y "D:\莫等闲\index.html" "D:\android-tools\modenxian-apk\www\index.html"
cd /d D:\android-tools\modenxian-apk
npx cap sync android

:: 2. 编译
set JAVA_HOME=D:\android-tools\jdk-17.0.21+9
set ANDROID_HOME=D:\android-tools\sdk
cd android
gradlew.bat assembleRelease
```

产物：`D:\android-tools\modenxian-apk\android\app\build\outputs\apk\release\app-release.apk`

## 为什么工程放在 D 盘外面

`D:\android-tools\modenxian-apk` 是纯 ASCII 路径。Gradle 在遇到中文路径（`D:\莫等闲`）时会拒绝编译，所以工程挪到了这里；网页本体仍然在 `D:\莫等闲`，改完拷过去同步即可。

## 已知限制

- 没有后台推送提醒（打开 App 才看到延期红条），和网页版一致。
- 只有 Android 包；iPhone 需要苹果开发者账号才能装第三方 App，暂时没做。
- 国内应用商店上架需要软件著作权等材料，这个包适合直接发给朋友安装。
