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

