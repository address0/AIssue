# SSAFY A403 AISSUE

<img src="docs/images/logo.png" alt="따다" height="200" width="150" />

- 배포 URL : https://k11a403.p.ssafy.io/

## 📅 **프로젝트 기간**

- 2024.10.14 ~ 2024.11.19

## 🙇🏻‍♂️ **팀원소개**

<div align="center">
  
| [최희현](https://github.com/coolfin) | [전태호](https://github.com/Taehororo) | [김성현](https://github.com/k-redstone) | [서승호](https://github.com/shocoding) | [주소영](https://github.com/CSchoice) |[장승연](https://github.com/yoonkyungseo) |
| :----------------------------------: | :-----------------------------------: | :-----------------------------------: | :-----------------------------------: | :-----------------------------------: | :-----------------------------------: | 
|<img src="https://avatars.githubusercontent.com/u/56531884?v=4" width="100">|<img src="https://avatars.githubusercontent.com/u/145996139?v=4" width="100">|<img src="https://avatars.githubusercontent.com/u/79430840?v=4" width="100">|<img src="https://avatars.githubusercontent.com/u/67960134?v=4" width="100">|<img src="docs/images/profile/choi.png" width="100">|<img src="docs/images/profile/yoon.png" width="100">|
|          FE, DESIGN          |                  FE, BE                  |              BE            |               INFRA, FE              |              FE, AI,DESIGN           |              FE              |

</div>

## 🧑🏻‍💻 개발 관련 기술

### 📋 git 이슈/브랜치 관리

### issue

- 프론트엔드와 백엔드, 데이터는 `label`로 분류한다.
- `assignees`는 이슈 생성자가 스스로 할당한다.
- 이슈 타입

  ```markdown
  FEAT : 새로운 기능 추가
  FIX : 버그 수정
  HOTFIX : 치명적인 버그 급하게 수정
  CHORE : (코드 수정 없는) 설정 변경
  DOCS : 문서 생성 및 수정
  DESIGN : 레이아웃 구현 및 디자인 수정
  REFACTOR : 리팩토링
  REMOVE : 파일/코드 삭제
  MERGE : 브랜치 병합
  ```

- 작성 예시
  **[타입] 이슈 명**
  - [FEAT] PWA 구현
  - [DESIGN] 랜딩 페이지 레이아웃 디자인

### branch

- 프론트엔드, 백엔드, 데이터는 접두사로 **`FE/ BE/ DATA/`** 를 붙인다.
- 브랜치 생성 시, 영문은 모두 **소문자**를 사용한다.
- git flow 방식을 채용하여 dev branch로 protect한다.
- 완료 된 작업에 대하여 PR 완료 이후 해당 작업 브랜치는 삭제한다.
- 생성 예시
  **분야/타입/#이슈번호\_이슈명**
  - FE-feat/#S11P31A403-140/text
  - FE-design/#S11P31A403-140/test

### commit

- 영문은 모두 **소문자**를 사용한다.
- 한글도 가능하다.
- 생성 예시
  - docs: TIL 생성
  - feat: PWA setting

### merge

- 영문은 모두 **소문자**를 사용한다.
- 내용은 템플릿을 사용한다.

### 👩🏻‍🔧 **기술 스택**

<div align="left">

### FE

---

#### 🚀 프레임워크 및 라이브러리

  <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&amp;logo=react&amp;logoColor=black" height="35">
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&amp;logo=nextdotjs&amp;logoColor=white" height="35">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&amp;logo=typeScript&amp;logoColor=white" height="35"> 
  
  #### 📊 상태 관리
  <img src="https://img.shields.io/badge/zustand-FFFFFF?style=for-the-badge&amp;logo=zustand&amp;" height="35"> 
  <img src="https://img.shields.io/badge/reactquery-FF4154?style=for-the-badge&amp;logo=reactquery&amp;logoColor=white" height="35">
  
  #### 📡 데이터 요청
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&amp;logo=axios&amp;logoColor=white" height="35">
  
  #### 💄 스타일링
  <img src="https://img.shields.io/badge/tailwind-06B6D4?style=for-the-badge&amp;logo=tailwindcss&amp;logoColor=white" height="35"> 
  <img src="https://img.shields.io/badge/html5-E34F26?style=for-the-badge&amp;logo=html5&amp;logoColor=white" height="35">
  
  #### 🔧 코드 품질 관리
  <img src="https://img.shields.io/badge/eslint-4B32C3?style=for-the-badge&amp;logo=eslint&amp;logoColor=white" height="35">
  <img src="https://img.shields.io/badge/prettier-F7B93E?style=for-the-badge&amp;logo=prettier&amp;logoColor=white" height="35">

### BE

---

#### 🚀 프레임워크 및 라이브러리

<img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&amp;logo=springboot&amp;logoColor=white" height="35"> 
<img src="https://img.shields.io/badge/spring_security-6DB33F?style=for-the-badge&amp;logo=springsecurity&amp;logoColor=white" height="35"> 
<img src="https://img.shields.io/badge/swagger-85EA2D?style=for-the-badge&amp;logo=swagger&amp;logoColor=white" height="35">

#### 📂 DB 및 스토리지

<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&amp;logo=mysql&amp;logoColor=white" height="35"> 
<img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&amp;logo=redis&amp;logoColor=white" height="35"> 
<img src="https://img.shields.io/badge/aws_s3-569A31?style=for-the-badge&amp;logo=amazons3&amp;logoColor=white" height="35">

### AI

---

<img src="https://img.shields.io/badge/openai-412991?style=for-the-badge&amp;logo=openai&amp;logoColor=white" height="35">

### INFRA

---

#### 🔗 CI/CD

<img src="https://img.shields.io/badge/jenkins-D24939?style=for-the-badge&amp;logo=jenkins&amp;logoColor=white" height="35"> 
<img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&amp;logo=docker&amp;logoColor=white" height="35"> 
<img src="https://img.shields.io/badge/nginx-009639?style=for-the-badge&amp;logo=nginx&amp;logoColor=white" height="35">

## 역할 분담

### 🍊최희현

- **FE**
  - 프론트 엔드 전반적 담당
  - 기본적인 디자인 담당
  - 프로젝트 정보, 전체 업무 로그, 프로젝트 일정

<br>
    
### 👻전태호

- 프론트, 백 기본 설정

- **FE**
  - 페이지 : 로그인, 회원가입, 실시간 채팅, 채팅 봇, 프로젝트 정보, 채팅 요약, pwa 설정
  - 공통 컴포넌트 : 채팅 모달
- **BE**
  - 프로필 설정 및 수정 페이지 유저 아이디 유효성 및 중복 검사, 실시간 채팅, 채팅 메세지, 채팅 요약, 채팅 요약 스케줄링, 에러 핸들링, 예외 핸들링, 백엔드 기본 설정

<br>

### 😎김성현

- **기획**

  - JIRA 번다운차트, 스프린트 관리
  - gitlab, frontend 코드 컨벤션 제작

- **BE**
  - jiraAPI를 이용한 통신 담당
  - issue 생성 및 수정
  - 스프린트 생성 및 수정
  - 에픽 생성 및 수정

### 🐱‍🏍서승호

- **INFRA**
  - 서버 관리 : 프런트, 백엔드 서버 관리
  - CI/CD 관리 : Docker를 사용해 Jenkins 파이프라인 관리
  - DB 인스턴스 관리 : mySQL, Redis 구축

<br>

### 🏓주소영

- **AI**
  - openAI api를 이용한 스프린트 자동 생성
  - 사용자와 대화형으로 정보 입력
  - 스프린트 내용 추가
- **DESIGN**
  - FIGMA 전체 와이어프레인 설계 및 전체 페이지 디자인
  - TailwindCSS 디자인가이드 제공
  - 컴포넌트 세부 디자인 코드 수정

<br>

### 🎯장승연

- **FE**
  - 달력

<br>

## 📖 **ERD**

<img src="docs/images/ERD_1.png" alt="erd_1" height="300" width="400" />
<img src="docs/images/ERD_2.png" alt="erd_2" height="400" width="300" />

<br>

## 📖 **Architecture**

<img src="docs/images/architecture.png" alt="architecture" height="300" width="400" />

<br>

## 📖 **페이지별 기능**

## ⚒️ **프로젝트 후기**

### 🍊최희현

느낀점

<br>
    
### 👻전태호
많은 것을 배울 수 있는 프로젝트였습니다. 곁에 든든한 프론트 팀원이 있다는게 정말 큰 힘이 되었습니다. 오직 개발에만 집중할 수 있도록 배려해준 팀원 덕분에 백엔드 개발에서 제가 할 수 있는 최대한을 보여줄 수 있었던 것 같습니다.
이렇게 제대로 된 분업이 프로젝트는 처음이라 이 경험을 양식 삼아 더욱 성장해나가겠습니다.

<br>

### 😎김성현

느낀점
<br>

### 🐱‍서승호

인프라 구축을 처음 하면서, 항상 궁금했던 인프라 구축에 대해서 배울 수 있는 시간이었습니다.
직접 해보니 간단하면서도 어려운 부분이 있었고, 직접 해보니 전체 구조를 더 잘 이해할 수 있었습니다.
다만, 조금 더 효율적으로 인프라 구축을 할 수 있겠다는 부분이 있었는데,
전체 프로젝트 마감을 지키기 위해서 수정을 못했는데 다음번에는 조금 더 효율적으로 인프라 구축을 해보고 싶습니다.

<br>

### 🏓주소영

느낀점
<br>

### 🎯장승연

느낀점
<br>
