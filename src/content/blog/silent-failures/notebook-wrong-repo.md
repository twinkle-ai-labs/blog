---
title: "배포 문서에 다른 제품의 저장소가 적혀 있었습니다"
date: 2026-09-02T21:00:00+09:00
tags: ["git","배포","자동화","문서","CI"]
slug: "notebook-wrong-repo"
lang: "ko"
author: "Heejeong Kim"
summary: "배포 문서에서 없는 npm 명령과 잘못된 원격 저장소를 찾았습니다. 문서 두 벌이 같은지만 검사하던 도구는 둘 다 통과시켰습니다."
---

## 들어가며

배포 문서인 `releaser.md`를 확인하다 포트폴리오의 원격 저장소가 `twinkle-ai-labs.github.io`로 적혀 있는 것을 발견했습니다. 그곳은 회사와 제품을 소개하는 홈의 저장소였습니다. 포트폴리오가 가야 할 곳은 `twinkle-ai-labs/portfolio`였습니다.

그날 홈을 두 번 배포하며 저장소 이름을 확인한 덕분에, 잘못된 지시를 실행하기 전에 알아봤습니다. 실제로 홈을 덮어쓰지는 않았습니다.

## 같은 날 낮에는 없는 npm 명령을 찾았습니다

낮에 먼저 발견한 오류는 navigravity의 배포 절차였습니다. 문서에는 `npm run lint && npm run build`가 적혀 있었지만, 그 저장소에 있는 스크립트는 `typecheck`, `test`, `build:web`였습니다.

`lint`를 실행하면 첫 명령에서 멈춥니다.

```bash
$ npm run lint
npm error Missing script: "lint"
npm error
npm error To see a list of scripts, run:
npm error   npm run
```

`package.json`과 문서를 대조해 이름을 고칠 수 있었습니다.

밤에 찾은 원격 주소는 달랐습니다. `twinkle-ai-labs.github.io`는 실제로 존재하고, 배포 권한도 있는 저장소였습니다. 포트폴리오를 빌드해 그 저장소의 `gh-pages`에 올리는 명령은 실행 자체에 문제가 없을 수 있었습니다.

지시대로 배포했다면 [twinklelabs.kr](https://twinklelabs.kr)에 소개 홈 대신 포트폴리오가 표시될 수 있었습니다. 낮의 npm 오류처럼 명령이 멈춰 주기를 기대할 수는 없었습니다.

## 두 문서가 같다는 검사만 있었습니다

배포 문서를 검사하는 도구가 없는 것은 아니었습니다. `agents-mirror.sh`가 `.claude`와 `.gemini`에 둔 문서 두 벌을 비교하고 있었습니다. 두 파일이 달라지면 알려주는 검사였습니다.

두 벌에는 똑같은 오류가 들어 있었습니다. 없는 npm 명령도, 다른 제품의 저장소 주소도 일치했으니 검사에서는 문제가 없었습니다.

## 마치며

문서의 잘못된 명령과 원격 주소를 고쳤습니다. 다만 그날 기록을 마칠 때까지 `npm run <스크립트>`를 각 저장소의 `package.json`과 대조하거나, 문서의 저장소 이름을 실제 원격과 비교하는 검사는 구현하지 못했습니다. 그 둘은 후속 작업으로 남겼습니다.
