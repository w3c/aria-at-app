## [1.15.0](https://github.com/w3c/aria-at-app/compare/v1.14.2...v1.15.0) (2025-05-28)


### Features

* Report Rerun ([#1348](https://github.com/w3c/aria-at-app/issues/1348)) ([e752e66](https://github.com/w3c/aria-at-app/commit/e752e669219e73127de4273ab14f6d5f83840eeb))
* updates sorting and filtering for AT-specific tables on Candidate Review Page ([#1402](https://github.com/w3c/aria-at-app/issues/1402)) ([dc8587b](https://github.com/w3c/aria-at-app/commit/dc8587b0bcbaa3fed8c6727b41f9c26cb345fbd2)), closes [#1382](https://github.com/w3c/aria-at-app/issues/1382)


### Bug Fixes

* Correct type of metrics ([#1403](https://github.com/w3c/aria-at-app/issues/1403)) ([726e1e3](https://github.com/w3c/aria-at-app/commit/726e1e3bbb6defb657e8774ffd020be5cee974bd))
* corrected content in failing assertions summary table subheader ([#1358](https://github.com/w3c/aria-at-app/issues/1358)) ([3901ba4](https://github.com/w3c/aria-at-app/commit/3901ba42a6c1dacf6a9b6fb9d2a105b5bdf4b212))
* Improve accuracy of rendered TestRenderer form ([#1409](https://github.com/w3c/aria-at-app/issues/1409)) ([c9fb427](https://github.com/w3c/aria-at-app/commit/c9fb427326d29e07ad05ef4a32e86a2cfe933522))
* Update text in Test Queue's Rerun Reports Tab ([#1413](https://github.com/w3c/aria-at-app/issues/1413)) ([5a9bc7b](https://github.com/w3c/aria-at-app/commit/5a9bc7bb72ead13dfe857a4a9602eb339330a7eb))
* Update the format for the Candidate Test Plan Run page titles ([#1406](https://github.com/w3c/aria-at-app/issues/1406)) ([88ef807](https://github.com/w3c/aria-at-app/commit/88ef807b9b004ca80c5aa58c92614ce6fe2ce158))

### [1.14.2](https://github.com/w3c/aria-at-app/compare/v1.14.1...v1.14.2) (2025-04-29)

### [1.14.1](https://github.com/w3c/aria-at-app/compare/v1.14.0...v1.14.1) (2025-04-10)


### Bug Fixes

* Align `ManageBotDialog` with Test Queue V2 visual changes ([#1361](https://github.com/w3c/aria-at-app/issues/1361)) ([0c0fff5](https://github.com/w3c/aria-at-app/commit/0c0fff51d8a44a9d4328e451ccfa3d184d4b28dd))
* Use cursor-based pagination for navigating GitHub issues ([#1372](https://github.com/w3c/aria-at-app/issues/1372)) ([0d1c2ee](https://github.com/w3c/aria-at-app/commit/0d1c2eea38968b544f12f260347ed87a5ee3fe65))

## [1.14.0](https://github.com/w3c/aria-at-app/compare/v1.13.1...v1.14.0) (2025-04-08)


### Features

* declare css variables; move away from styled components ([#1338](https://github.com/w3c/aria-at-app/issues/1338)) ([794fabc](https://github.com/w3c/aria-at-app/commit/794fabc52fd29a8a0de008d32a9c38ca6185bf2e))
* Include `ReviewerStatus` table ([#1328](https://github.com/w3c/aria-at-app/issues/1328)) ([053d2f0](https://github.com/w3c/aria-at-app/commit/053d2f070ab53147e953de0b483b970e0e04f51b)), closes [#1343](https://github.com/w3c/aria-at-app/issues/1343)


### Bug Fixes

* `releasedAt` attribute-related fixes ([#1356](https://github.com/w3c/aria-at-app/issues/1356)) ([1d13640](https://github.com/w3c/aria-at-app/commit/1d1364030eafe932408ac5eb4fc0a04284f2d8bc))
* Incorrect GitHub sourced-issues count and displays ([#1357](https://github.com/w3c/aria-at-app/issues/1357)) ([bb83bc1](https://github.com/w3c/aria-at-app/commit/bb83bc1e139abe859948397a3b78ca0be46d20eb))

### [1.13.1](https://github.com/w3c/aria-at-app/compare/v1.13.0...v1.13.1) (2025-03-17)


### Bug Fixes

* Account for `referencePage` update during copy process ([#1340](https://github.com/w3c/aria-at-app/issues/1340)) ([b1a8483](https://github.com/w3c/aria-at-app/commit/b1a8483dca0e716ddab4e6fcd578268972c451ac))
* Revise length of generated GitHub issue link to avoid hitting URI max length ([#1336](https://github.com/w3c/aria-at-app/issues/1336)) ([a6f5c9f](https://github.com/w3c/aria-at-app/commit/a6f5c9f4cecf84bc5a3a34dc996d7efb67df3a94))

## [1.13.0](https://github.com/w3c/aria-at-app/compare/v1.12.0...v1.13.0) (2025-03-17)


### Features

* Group required reports in test plan report status dialog ([#1337](https://github.com/w3c/aria-at-app/issues/1337)) ([a705888](https://github.com/w3c/aria-at-app/commit/a705888df6a53abb69f011a94ffd641678949769))


### Bug Fixes

* Include result of undesirable behaviors assertions in summary of failing assertions ([#1317](https://github.com/w3c/aria-at-app/issues/1317)) ([8ea4def](https://github.com/w3c/aria-at-app/commit/8ea4def8f9212ba4ea1f4e52bfad5613d764fee0))


### Reverts

* Revert "Update testers list" ([e95fdbb](https://github.com/w3c/aria-at-app/commit/e95fdbbb6bfe0c7f8e734f532daebd55ddc93a9a))

## [1.12.0](https://github.com/w3c/aria-at-app/compare/v1.11.0...v1.12.0) (2025-02-05)


### Features

* Add report section summarizing failing assertions from all tests in a plan ([#1288](https://github.com/w3c/aria-at-app/issues/1288)) ([46851ce](https://github.com/w3c/aria-at-app/commit/46851cede6764b74aa186bf8ccba72758ce5ed30))
* Include Settings page for admin and UI to manually import latest test plan versions ([#1290](https://github.com/w3c/aria-at-app/issues/1290)) ([7e22455](https://github.com/w3c/aria-at-app/commit/7e224551e19796c8f660f7151990983c12872d40))


### Bug Fixes

* Include additional "Raise an Issue" links ([#1281](https://github.com/w3c/aria-at-app/issues/1281)) ([7563f6d](https://github.com/w3c/aria-at-app/commit/7563f6df67dcc0a495c3778965d26b47979f46e1))
* Prevent reassignment of bot run before status is completed, cancelled, or errored ([#1300](https://github.com/w3c/aria-at-app/issues/1300)) ([0d09b37](https://github.com/w3c/aria-at-app/commit/0d09b377830280f040199f02dc1577fa5da40630))

## [1.11.0](https://github.com/w3c/aria-at-app/compare/v1.10.0...v1.11.0) (2024-12-10)


### Features

* Track vendor approvals across version updates through result copy process ([#1267](https://github.com/w3c/aria-at-app/issues/1267)) ([90807df](https://github.com/w3c/aria-at-app/commit/90807df4b71ea13b25b2e2dd1a0ca03a5976c743))


### Bug Fixes

* Allow AT and Browser versions to be edited when bot run is assigned to manual tester for evaluation ([#1279](https://github.com/w3c/aria-at-app/issues/1279)) ([a6c0bda](https://github.com/w3c/aria-at-app/commit/a6c0bda680b9be6ac10966c9cad9603adf6c24ac))

## [1.10.0](https://github.com/w3c/aria-at-app/compare/v1.9.3...v1.10.0) (2024-11-07)


### Features

* Issues table for Test Plan Review page ([#1269](https://github.com/w3c/aria-at-app/issues/1269)) ([cdd212d](https://github.com/w3c/aria-at-app/commit/cdd212d6a3cf9f1f673a5c445d8893fbdcc0520f))
* Sortable issues table, improved issues table heading ([#1266](https://github.com/w3c/aria-at-app/issues/1266)) ([18fd21c](https://github.com/w3c/aria-at-app/commit/18fd21c1eda8adddca77b4f8edb62a9844e6ee11))


### Bug Fixes

* Exclude unsupported assertion results from failure count in report headings; use separate "unsupported" metric ([#1265](https://github.com/w3c/aria-at-app/issues/1265)) ([9c54e2d](https://github.com/w3c/aria-at-app/commit/9c54e2d12e471c69f3bb5e79a11193df33c7fbe9))
* sortable table th rendering bug ([#1272](https://github.com/w3c/aria-at-app/issues/1272)) ([77ba7cf](https://github.com/w3c/aria-at-app/commit/77ba7cf0cad94ff2a795f615cdc3fd7558d89713))

### [1.9.3](https://github.com/w3c/aria-at-app/compare/v1.9.2...v1.9.3) (2024-10-28)


### Bug Fixes

* Ignore `renderableContent.info.references` changes when doing test results copy ([#1261](https://github.com/w3c/aria-at-app/issues/1261)) ([41c968b](https://github.com/w3c/aria-at-app/commit/41c968bf8163132c6f8fcb8852487fb8652e0680))

### [1.9.2](https://github.com/w3c/aria-at-app/compare/v1.9.1...v1.9.2) (2024-10-16)


### Bug Fixes

* Remove errant trim in vendor auth ([#1244](https://github.com/w3c/aria-at-app/issues/1244)) ([25edf06](https://github.com/w3c/aria-at-app/commit/25edf06156fe8f2e09bde72c093b61b3b03953ad))

### [1.9.1](https://github.com/w3c/aria-at-app/compare/v1.9.0...v1.9.1) (2024-10-10)


### Bug Fixes

* Only include CollectionJob metrics in Bot Status calculation on Test Queue page when `tester.isBot` is true ([#1237](https://github.com/w3c/aria-at-app/issues/1237)) ([84e0bd0](https://github.com/w3c/aria-at-app/commit/84e0bd0b46e80bea8c5c43eae3b5b4e6ffdce5b9))

## [1.9.0](https://github.com/w3c/aria-at-app/compare/v1.8.1...v1.9.0) (2024-10-09)


### Features

* Vendor verification ([#1208](https://github.com/w3c/aria-at-app/issues/1208)) ([b8b13d4](https://github.com/w3c/aria-at-app/commit/b8b13d48a5e05e31613bfea54678a30b525d18c6))


### Bug Fixes

* Add tests for retry cancelled collection jobs ([#1214](https://github.com/w3c/aria-at-app/issues/1214)) ([34d7aac](https://github.com/w3c/aria-at-app/commit/34d7aac53492b5077fe487ef51e2a7bd5c536afc))
* Assertion with EXCLUDE priority causing test result submit errors ([#1229](https://github.com/w3c/aria-at-app/issues/1229)) ([d7cc1fd](https://github.com/w3c/aria-at-app/commit/d7cc1fd6efe3a72b3df6158a5d1fb9580f3f6de2))

### [1.8.1](https://github.com/w3c/aria-at-app/compare/v1.8.0...v1.8.1) (2024-09-23)


### Bug Fixes

* Change testNumberFilteredByAt type from Int to Float ([#1219](https://github.com/w3c/aria-at-app/issues/1219)) ([9b023f9](https://github.com/w3c/aria-at-app/commit/9b023f95e73d1c86e1f1bb5aa3f9a8571d9097ed))

## [1.8.0](https://github.com/w3c/aria-at-app/compare/v1.7.0...v1.8.0) (2024-09-18)


### Features

* Allows testers' results to be publicly viewable ([#1209](https://github.com/w3c/aria-at-app/issues/1209)) ([afede8d](https://github.com/w3c/aria-at-app/commit/afede8d9dae02e963cdd21e5fd950ba2de390017))
* Enhanced conflict review ([#1195](https://github.com/w3c/aria-at-app/issues/1195)) ([fbae626](https://github.com/w3c/aria-at-app/commit/fbae626e2e3905b558a40dd1cb8d2285741b3eb2)), closes [#975](https://github.com/w3c/aria-at-app/issues/975)


### Bug Fixes

* Conditionally present 'conflict' or 'conflicts' on TestQueue Status column ([#1215](https://github.com/w3c/aria-at-app/issues/1215)) ([4e51862](https://github.com/w3c/aria-at-app/commit/4e51862244670fbac9aef72c55ccd7a3911e80ed))
* Vendor review approval modal content edit and close button fix ([#1206](https://github.com/w3c/aria-at-app/issues/1206)) ([733f446](https://github.com/w3c/aria-at-app/commit/733f44691e71eadacff3ef778b2b345c626bfb3b)), closes [#1202](https://github.com/w3c/aria-at-app/issues/1202) [#1203](https://github.com/w3c/aria-at-app/issues/1203)


### Reverts

* Revert "Move from `express` v5-beta to `express` v5 (#1210)" ([08b2a91](https://github.com/w3c/aria-at-app/commit/08b2a9101e86c621dce96f6846bbd6ac71128540)), closes [#1210](https://github.com/w3c/aria-at-app/issues/1210)

## [1.7.0](https://github.com/w3c/aria-at-app/compare/v1.6.0...v1.7.0) (2024-08-26)


### Features

* Content updates to Candidate Review page ([#1186](https://github.com/w3c/aria-at-app/issues/1186)) ([c64e584](https://github.com/w3c/aria-at-app/commit/c64e5843443f94949e2fca0c62499c9386ad5f07))
* Test navigation via URI fragment ([#1188](https://github.com/w3c/aria-at-app/issues/1188)) ([b2b0560](https://github.com/w3c/aria-at-app/commit/b2b056087ffca4a596566ad6f264198b22987dc4))
* Use standardized gql fragments in queries.js files ([#1147](https://github.com/w3c/aria-at-app/issues/1147)) ([dd4b8c2](https://github.com/w3c/aria-at-app/commit/dd4b8c26fff84600db05f89a58de76eef5135861)), closes [#876](https://github.com/w3c/aria-at-app/issues/876)


### Bug Fixes

* Basic snapshot testing ([#1175](https://github.com/w3c/aria-at-app/issues/1175)) ([84e269d](https://github.com/w3c/aria-at-app/commit/84e269d213169369cdf33a93b9144b04aabd4fa3))
* Only match with single alphanumeric keys in "Assign Testers" dropdown search, ignore Tab ([#1196](https://github.com/w3c/aria-at-app/issues/1196)) ([a80b80b](https://github.com/w3c/aria-at-app/commit/a80b80b447be82eaac7dbc0e15724ebae0c51cca))
* Radio buttons for assertion verdicts ([#1161](https://github.com/w3c/aria-at-app/issues/1161)) ([eb8f9ea](https://github.com/w3c/aria-at-app/commit/eb8f9ea86a450644da3795f3e2d1325f766504d0)), closes [#1045](https://github.com/w3c/aria-at-app/issues/1045)
* Update and expand `/client` tests ([#1169](https://github.com/w3c/aria-at-app/issues/1169)) ([abe3086](https://github.com/w3c/aria-at-app/commit/abe3086feb8b7cdc5eff72890c88b3717d08ccc6))

## [1.6.0](https://github.com/w3c/aria-at-app/compare/v1.5.0...v1.6.0) (2024-07-29)


### Features

* permit automated testing for firefox and chrome with voiceover ([#1170](https://github.com/w3c/aria-at-app/issues/1170)) ([9c73ab5](https://github.com/w3c/aria-at-app/commit/9c73ab516ac8f6bfbc0138191351ce84d680c732))


### Bug Fixes

* Update metrics calculations and related UI components ([#1172](https://github.com/w3c/aria-at-app/issues/1172)) ([e4242bc](https://github.com/w3c/aria-at-app/commit/e4242bcb38eec20eb50794f96c0bc8ae9a5aba97))


### Reverts

* revert accidental commit directly to develop ([d1c409c](https://github.com/w3c/aria-at-app/commit/d1c409c6f33005467f426771593c2c7eb00eef9b))

## [1.5.0](https://github.com/w3c/aria-at-app/compare/v1.4.0...v1.5.0) (2024-07-22)


### Features

* Specify AtVersion for automation ([#1144](https://github.com/w3c/aria-at-app/issues/1144)) ([52865e2](https://github.com/w3c/aria-at-app/commit/52865e2192ebeb8ae6f41b23a8b05d4923bdb2a3))
* Test Run / Navigator polling updates for collection jobs ([#1125](https://github.com/w3c/aria-at-app/issues/1125)) ([29456fc](https://github.com/w3c/aria-at-app/commit/29456fcf7ef9dd808a7d70131c95c43fb8f4b0ca))
* Update Dependencies ([#1148](https://github.com/w3c/aria-at-app/issues/1148)) ([6b4aedd](https://github.com/w3c/aria-at-app/commit/6b4aeddac40bc93599b1a215bcaa41bdc622d12a))


### Bug Fixes

* Add "View Logs" button to Manage Bot Run Dialog ([#1152](https://github.com/w3c/aria-at-app/issues/1152)) ([6379fd0](https://github.com/w3c/aria-at-app/commit/6379fd0c25159dec6a7ef6323b322ac6346e4208))
* onHide error thrown on ESC press when <UpdateVersionModal /> is open ([d118b35](https://github.com/w3c/aria-at-app/commit/d118b35418d4e8f9b43dbd2a4ec53f84575150c6))
* random key for each collection job ([#1135](https://github.com/w3c/aria-at-app/issues/1135)) ([78fab77](https://github.com/w3c/aria-at-app/commit/78fab77f7fe8f9d53a2d03920cea794aa9a8c07a))
* Remove TestQueue v1 and update Test Queue e2e tests ([#1146](https://github.com/w3c/aria-at-app/issues/1146)) ([fd6e86f](https://github.com/w3c/aria-at-app/commit/fd6e86f75af2be7cfc2b957897e07c36601aa227))
* Reset TestPlanVersion `nextval` during import if IDs aren't used ([#1153](https://github.com/w3c/aria-at-app/issues/1153)) ([c913504](https://github.com/w3c/aria-at-app/commit/c913504355a53adfef2bb807bc4629430c4bd044))
* terminology update for priority 3 (MAY), passed/failing -> supported/unsupported ([#1150](https://github.com/w3c/aria-at-app/issues/1150)) ([1f61c87](https://github.com/w3c/aria-at-app/commit/1f61c87fa0bad33e63e2ce145fe989942b332dd8))

## [1.4.0](https://github.com/w3c/aria-at-app/compare/v1.3.1...v1.4.0) (2024-06-24)


### Features

* Trends ([#1123](https://github.com/w3c/aria-at-app/issues/1123)) ([af8f492](https://github.com/w3c/aria-at-app/commit/af8f492b7d40ffadcedec88c47d06b166ec489fe)), closes [#791](https://github.com/w3c/aria-at-app/issues/791) [#792](https://github.com/w3c/aria-at-app/issues/792) [#1055](https://github.com/w3c/aria-at-app/issues/1055) [#1001](https://github.com/w3c/aria-at-app/issues/1001) [#1065](https://github.com/w3c/aria-at-app/issues/1065) [#1052](https://github.com/w3c/aria-at-app/issues/1052) [#1087](https://github.com/w3c/aria-at-app/issues/1087) [#1098](https://github.com/w3c/aria-at-app/issues/1098) [#1092](https://github.com/w3c/aria-at-app/issues/1092) [#1131](https://github.com/w3c/aria-at-app/issues/1131) [#1124](https://github.com/w3c/aria-at-app/issues/1124)


### Bug Fixes

* use correct test number sequence for raising github issues ([#1128](https://github.com/w3c/aria-at-app/issues/1128)) ([70270e3](https://github.com/w3c/aria-at-app/commit/70270e3d83bf1eca6ea8f74cef4fcba104b1e783))

### [1.3.1](https://github.com/w3c/aria-at-app/compare/v1.3.0...v1.3.1) (2024-06-12)


### Bug Fixes

* add test for decimal rowNumber test automation ([#1114](https://github.com/w3c/aria-at-app/issues/1114)) ([347bf07](https://github.com/w3c/aria-at-app/commit/347bf07261d4cc3606b05b04742a2388cb1a1add)), closes [#1106](https://github.com/w3c/aria-at-app/issues/1106)
* Include the latest w3c/aria-at data imports in tests and update sample data ([#1111](https://github.com/w3c/aria-at-app/issues/1111)) ([ae90bce](https://github.com/w3c/aria-at-app/commit/ae90bce0ce56e00d0b4d9b0c8b823f62e5618bbf))
* Update incorrectly set deprecation dates for test plan versions ([#1122](https://github.com/w3c/aria-at-app/issues/1122)) ([d077bb5](https://github.com/w3c/aria-at-app/commit/d077bb54c2be8a0ce1ea93992d69ea7ff1543eeb)), closes [#966](https://github.com/w3c/aria-at-app/issues/966)

## [1.3.0](https://github.com/w3c/aria-at-app/compare/v1.2.1...v1.3.0) (2024-05-28)


### Features

* Add workflow to automate deployment to aria-at.w3.org on a push to the main branch ([#1050](https://github.com/w3c/aria-at-app/issues/1050)) ([3c53580](https://github.com/w3c/aria-at-app/commit/3c535804a5c2bce4416c89c84ab4e0bcca48135b))
* Enable automation support for VoiceOver/Safari/MacOS ([#1101](https://github.com/w3c/aria-at-app/issues/1101)) ([c1e0688](https://github.com/w3c/aria-at-app/commit/c1e06884c28bb25a2134674b09e1310640a107f3))
* Redesign support table to match APG styling, addresses [#212](https://github.com/w3c/aria-at-app/issues/212) ([#1056](https://github.com/w3c/aria-at-app/issues/1056)) ([b8cefcd](https://github.com/w3c/aria-at-app/commit/b8cefcdae71963ee2fe8ac6bc6c65bbe8ef00c7e))
* Restructure APG Support Tables ([#1053](https://github.com/w3c/aria-at-app/issues/1053)) ([7b75cbe](https://github.com/w3c/aria-at-app/commit/7b75cbe4f614fd8a47003cad194c13203abaf404))


### Bug Fixes

* Add support in import test script for importing test harness ([#1064](https://github.com/w3c/aria-at-app/issues/1064)) ([2af0b88](https://github.com/w3c/aria-at-app/commit/2af0b88f751ed13c925c2204f4a485fc5f924be4))
* Add type-ahead to assign tester dropdown ([#1095](https://github.com/w3c/aria-at-app/issues/1095)) ([b6a5f54](https://github.com/w3c/aria-at-app/commit/b6a5f543a98d1846896cff0945c558fd782cda31)), closes [#991](https://github.com/w3c/aria-at-app/issues/991)
* Correct sorting for the tester assignment menu, addresses [#993](https://github.com/w3c/aria-at-app/issues/993) ([#1067](https://github.com/w3c/aria-at-app/issues/1067)) ([01c818f](https://github.com/w3c/aria-at-app/commit/01c818f5f4ee0310c85d3b6e30585cb6a594c7c2))
* correctly support rowNumbers like 14.1 with automation ([#1105](https://github.com/w3c/aria-at-app/issues/1105)) ([2b88c5f](https://github.com/w3c/aria-at-app/commit/2b88c5f18dc16b91adb66256cbfd15a9f4e0d5cc))
* Focus first item in menu dropdowns ([#1089](https://github.com/w3c/aria-at-app/issues/1089)) ([8429aa6](https://github.com/w3c/aria-at-app/commit/8429aa6a5510a45580b94358faa0af23e4444e3d)), closes [#992](https://github.com/w3c/aria-at-app/issues/992)
* status for RUNNING tests updates when job status becomes finalized ([#1094](https://github.com/w3c/aria-at-app/issues/1094)) ([a062f63](https://github.com/w3c/aria-at-app/commit/a062f631cf8e117284ba4963ea05e8a67483d2fe))
* Update paths for import tests in main.yml deploy ([#1100](https://github.com/w3c/aria-at-app/issues/1100)) ([9414180](https://github.com/w3c/aria-at-app/commit/9414180047e8e668151c22af147fb74a14fb0df6))
* Use aria-checked for AssignTesterDropdown ([#1097](https://github.com/w3c/aria-at-app/issues/1097)) ([ae97530](https://github.com/w3c/aria-at-app/commit/ae97530e2545c3812f1e1dc2b8a8556f30de6670)), closes [#977](https://github.com/w3c/aria-at-app/issues/977)

### [1.2.1](https://github.com/w3c/aria-at-app/compare/v1.2.0...v1.2.1) (2024-05-06)


### Bug Fixes

* Improve Windows support by to stripping ansi colors ([#1084](https://github.com/w3c/aria-at-app/issues/1084)) ([3edc15e](https://github.com/w3c/aria-at-app/commit/3edc15e2aa54dcbde78c69853645755f01e8421a))
* Make sorting tests easier by supporting decimal presentation numbers  - Address [#1085](https://github.com/w3c/aria-at-app/issues/1085) ([#1086](https://github.com/w3c/aria-at-app/issues/1086)) ([761e4aa](https://github.com/w3c/aria-at-app/commit/761e4aaae0a589c5ca679699921c6eac1df57f27))

## [1.2.0](https://github.com/w3c/aria-at-app/compare/v1.1.0...v1.2.0) (2024-04-29)


### Features

* Enhance copy results functionality ([#967](https://github.com/w3c/aria-at-app/issues/967)) ([3a4d3c8](https://github.com/w3c/aria-at-app/commit/3a4d3c8d8f36b0808385a16d58b8083f2e0494ec)), closes [#935](https://github.com/w3c/aria-at-app/issues/935)


### Bug Fixes

* Fix view log button on test run ([#1054](https://github.com/w3c/aria-at-app/issues/1054)) ([8b46827](https://github.com/w3c/aria-at-app/commit/8b46827288eaea1a72c583199f6303c47933d0ff))

## [1.1.0](https://github.com/w3c/aria-at-app/compare/f11234e4565d8009af0ff06ea039a84384693bd7...v1.1.0) (2024-04-08)


### Features

* Add workflow to include automatic deployments to staging ([#912](https://github.com/w3c/aria-at-app/issues/912)) ([226a472](https://github.com/w3c/aria-at-app/commit/226a4724e46fd01b4db29b4fc299f48dd2c39ead))
* Include workflow for automatic CHANGELOG and version bumps ([#913](https://github.com/w3c/aria-at-app/issues/913)) ([f981da8](https://github.com/w3c/aria-at-app/commit/f981da803a387e008a702ecd36466d4fd8783971))


### Bug Fixes

* return affected TestPlanReport instead of dataset for assign and remove tester ([f11234e](https://github.com/w3c/aria-at-app/commit/f11234e4565d8009af0ff06ea039a84384693bd7))


### Reverts

* Revert "Force certificates to renew" (#998) ([33d5f7b](https://github.com/w3c/aria-at-app/commit/33d5f7b0c9338894855c344170c122b0556e339d)), closes [#998](https://github.com/w3c/aria-at-app/issues/998)
* Revert "Handle focus leaving non-focusable header element backwards in FocusTrapper" ([7783342](https://github.com/w3c/aria-at-app/commit/7783342875e1325d61514a2dbf53509b4f81df17))
* Revert "Update React" ([d791f17](https://github.com/w3c/aria-at-app/commit/d791f17146707433b077821a7a759c7177487d81))
* Revert "Update React" ([944c873](https://github.com/w3c/aria-at-app/commit/944c873e9e5ac1a3672ef16f24ca56337a3efbcb))
* Revert "Update React" ([56c2208](https://github.com/w3c/aria-at-app/commit/56c2208d9fd18956cb63f8203bf01914ec3a3e77))
* Revert "Update React" ([944130e](https://github.com/w3c/aria-at-app/commit/944130e9013e9d7c5cc3aa1a5b4bf6a81cd3c456))
* Revert "Add Test Plan to Test Queue modal dialog accessibility modifications (#361)" ([8aa182d](https://github.com/w3c/aria-at-app/commit/8aa182da60d22ba76f694b5ac3fbeec65ab6ade5)), closes [#361](https://github.com/w3c/aria-at-app/issues/361)

