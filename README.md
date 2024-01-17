# 🚀 Nwitter 프로젝트 
<br>
본 프로젝트는 우주 배경의 테마로 된 학교 커뮤니티 사이트를 구현하는 것을 목표로 한 프로젝트입니다. <br>
이 사이트는 주로 학생들이 정보를 공유하고 주고받는 플랫폼으로 기획되었습니다. <br>
트위터의 업데이트되는 정보 흐름을 모델로 삼아, 기본적인 트윗 기능과 북마크 및 메모 기능을 통합했습니다.
<br>
<br>
트위터와 인스타그램 같은 인기 있는 SNS 웹사이트의 레이아웃을 참고하여 다양한 형태로 설계되었습니다. <br>
이를 통해 사용자들에게 친숙하면서도 새로운 경험을 제공하는 커뮤니티 공간을 만들고자 했습니다.
<br>
<br>

현재 보시는 코드는 **nwitter 프로젝트의 백엔드 코드** 입니다.

<br>

### 💻 프론트엔드 코드

Nwitter 프로젝트의 프론트 코드를 보고 싶다면 [여기를 클릭하세요](https://github.com/goops2000/My-Nwitter)

<br>

## 배포 링크
실제 작동중인 사이트를 보고싶다면 [여기를 클릭하세요](https://my-nwitter.vercel.app/)
<br>
<br>

## 프로젝트 이미지

<img src="https://github.com/goops2000/My-Nwitter/assets/96044112/af7262ad-e10e-4cae-a93a-d79d6d2928e8" width="400" height="300">
<img src="https://github.com/goops2000/My-Nwitter/assets/96044112/fa68a565-451c-4263-bc92-55380e8f64d0" width="400" height="300">
<img src="https://github.com/goops2000/My-Nwitter/assets/96044112/2626a52b-855f-499a-8413-34d24e0e3881" width="400" height="300">
<img src="https://github.com/goops2000/My-Nwitter/assets/96044112/c507420b-7e0a-42bd-af41-736036e00dea" width="400" height="300">

<br>
<br>


## 사용한 기술과 라이브러리

**프론트엔드 :**  `React`, `Typescript`, `Redux`, `React-Query`, `SCSS`

**백엔드 :** `Node.js`, `Express.js`, `JWT`, `WebSocket`

**데이터베이스 :** `MySQL` (`Sequelize` ORM 사용), `Redis`(채팅서비스)

**클라우드 및 배포 :** `AWS`, `AWS RDS`, `Vercel` 

<br>

## 기능

- **회원가입 및 로그인 기능**:  jwt 토큰과 쿠키 사용 기반의 사용자 계정 생성 및 인증, 로그인 상태에 따른 라우팅 기능
- **게시물 업로드 기능** : formData, multer, mysql, sequelize 기반의 다양한 형식의 콘텐츠 업로드 기능
- **게시물 하단 부가 기능** : 리트윗, 북마크, 좋아요, 댓글 등의 트윗 게시물 하단 버튼 기능
- **북마크와 메모 기능** : 북마크 페이지 생성하여 북마크 데이터와 사용자 메모 연동 기능
- **페이지네이션 및 Explore 기능** : 페이지네이션, 무한스크롤, 최신순/인기순 정렬, 팔로우, SearchBar 검색 기능
- **메세지 채팅 기능** : websocket, redis기반의 사용자 간의 메세지 채팅 기능
- **프로필 관리 및 게시물 수정/삭제 기능** : 사용자 프로필 수정, 트윗 게시물 삭제 또는 수정 기능
<br>


## 프로젝트 설치 및 실행 방법

1. 저장소 클론:
```
git clone https://github.com/goops2000/My-Nwitter-Backend.git
```

2. 의존성 설치:
```
npm install
```

3. 애플리케이션 실행:
```
npm run dev
```


 이제 `(http://localhost:1234/)`서버에 접근할 수 있습니다.
<br>
<br>

\
