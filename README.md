# UFO_backend

## 프로젝트 소개
### 문제 인식
- 한국인 유학생을 위한 커뮤니티가 존재하지 않음.
- 현재 카카오톡 오픈채팅 또는 페이스북을 통해 소통을 하고 있으나, 단점이 명확함.
- 한인회 회장/부회장 등을 뽑는 것을 현재 구글독스를 통해 진행중

### 서비스 기획
- 타겟층 : 유학생 (미국, 일본, 영국, 호주, ?베트남? 캐나다?)
- 유학생들을 위한 커뮤니티(에타, 블라인드)
- 회장/부회장을 투표할 수 있음.
- 한인회 공지를 올릴 수 있는 사이트

### 메인 기능
- 통합 커뮤니티(지역별 태그/필터)
- 게시판 카테고리 - 질문, 정보, 주거, 취업, 연애, 게임, 유머, 코로나, 장터, 취미, 기타
- 학교 카테고리 - 수업, 맛집, 스터디, 알바, 대나무숲, 익명, 기타
- 본인 학교만의 익명 커뮤니티
- 핫이슈 게시글(최상단 배치)
- 회장 부회장 선거 기능
- .edu 이메일 사용하는 사용자 인증
- 소셜 로그인

- ## 프로젝트 기간
  2021/07/23 ~ 2021/09/03

## 1. Wireframe (Figma)
https://www.notion.so/yzkim9501/1e66a5c0275a4f6aa29f75d34eb0b095#792c4fba41de4965b632d90e3ddc9bcf

## 2. Developers

### Backend (Node.js)
  - 장상현
  - 김예지
  - 이은택

### Frontend (React)
  - 김정후
  - 권지영
  - 장희성


## 3. 노션 설계 페이지
https://yzkim9501.notion.site/UFO-3-b9bf655f15444276bdc50eda67336904

## 4. 기술스택 및 라이브러리

|     종류      |  이름   |
| :-----------: | :-----: |
|   개발 언어   | Node.js |
| 데이터베이스  | Mysql |
| 웹 프레임워크 | Express |

|  라이브러리  |       Appliance       |
| :----------: | :-------------------: |
| jsonwebtoken |        암호화         |
|   sequelize   | DB ORM |
|     joi      |   Validation Check    |
|     cors     | Request Resource 제한 |
|     swagger     | API 문서화 |
|     eslint     | 코드 자동 포맷팅 |
|     jest     | 테스트 |
|     passport     | 로그인 및 소셜 로그인 |
|     dotenv     | 환경변수 설정 |
