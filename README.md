# UFO_backend

https://ufo.town/

## 프로젝트 소개

### 메인 기능
- 통합 커뮤니티(지역별 태그/필터)
- 게시판 카테고리 - 질문, 정보, 주거, 취업, 연애, 게임, 유머, 코로나, 장터, 취미, 기타
- 학교 카테고리 - 수업, 맛집, 스터디, 알바, 대나무숲, 익명, 기타
- 본인 학교만의 익명 커뮤니티
- 핫이슈 게시글(최상단 배치)
- 회장 부회장 선거 기
- .edu 이메일 사용하는 사용자 메일 인증 & 환영가입 메일

![image](https://user-images.githubusercontent.com/81303869/132338263-4693edff-6ed5-40d7-a1fe-122302ac0069.png)

### 문제 인식
- 2021년 9월 현재, 유학생 커뮤니티가 존재하지 않음.
- 타지에서 소통의 답답함을 느끼는 유학생이 많다!
- 유학생 한인회 회장 선거를 "구글 독스, 카카오톡 투표하기" 등의 비정형화된 시스템으로 진행중...ㅜㅜ
- 우리가 서비스로서 유학생 커뮤니티를 개발한다면, 확실한 타겟이 있는 좋은 서비스를 제공할 수 있을 것이라 판단하여 기획!

### 서비스 기획
- 타겟층 : 유학생 (미국, 일본, 영국, 호주, 베트남, 캐나다)
- 유학생들을 위한 커뮤니티(에타, 블라인드)
- 회장/부회장을 투표할 수 있음.
- 한인회 공지를 올릴 수 있는 사이트

## 프로젝트 기간
  2021/07/23 ~ 2021/09/03

<!-- ## 1. Wireframe (Figma)
https://www.notion.so/yzkim9501/1e66a5c0275a4f6aa29f75d34eb0b095#792c4fba41de4965b632d90e3ddc9bcf -->

## 1. Developers

### Backend (Node.js)
  - 장상현
  - 김예지

### Frontend (React)
  - 김정후
  - 권지영
  - 장희성

## 2. 노션 설계 페이지
https://www.notion.so/yzkim9501/UFO-3-b9bf655f15444276bdc50eda67336904

## 3. Front-end Repository
https://github.com/hanghae99-final-3/UFO-frontend
## 4. 기술스택 및 라이브러리

|     종류      |  이름   |
| :-----------: | :-----: |
|   개발 언어   | Node.js |
| 데이터베이스  | Mysql |
| 웹 프레임워크 | Express |

|  라이브러리  |       Appliance       |
| :----------: | :-------------------: |
| jenkins |        CI/CD         |
| jsonwebtoken |        암호화         |
|   sequelize   | DB ORM |
|     joi      |   Validation Check    |
|     cors     | Request Resource 제한 |
|     swagger     | API 문서화 |
|     eslint     | 코드 자동 포맷팅 |
|     bcrypt     | 패스워드 암호화 |
|     multer     | 사진 업로드 |
|     dotenv     | 환경변수 설정 |
|     certbot     | https 적용 |
|     nodemailer     | 회원인증 및 비밀번호 찾기 메일링 |
|     RabbitMQ     | 메일링 서비스 비동기 메시지 큐 |
|     node-schedule     | cron |

## 5. 기술적 챌린지

### 인기 게시글 구현

- 로직상의 고민
    1. `조회수`, `댓글`, `좋아요` 각각의 가치를 몇 점으로 두고 점수를 부여할지?
    → `조회수` * 1 + `댓글` * 10 + `좋아요` * 20점으로 계산하여 Ranking 부여
    2. 산정 대상의 글은 어느 정도의 기간을 둘 지?
    → 갱신 시각 기준으로 하루 전까지의 글만 집계 (`node-schedule` 사용 )
    3. 새로운 인기 게시글의 갱신 주기는 어떻게 할 지?
    → 1시간

- 구현시 문제점들
    1. 게시판 조회 시 `sequelize.fn`의 attributes 속성으로 조인시킨 두 테이블 (댓글, 좋아요) 의 댓글수, 좋아요 수 COUNT 기능 사용하여 계산하려 했으나 조인되는 모델에 대한 distinct 옵션을 sequelize에서 지원하지 않음.
    → join시 include되는 model에 대한 distinct 옵션을 사용하기 위해 `raw query` 사용이 낫겠다 판단하여 아래 쿼리문으로 전환.

    ```jsx
    await sequelize.query(
          "select free_board.post_id,\
          free_board.view_count\
          + count(distinct free_comment.user_id) * 10\
          + count(distinct free_like.user_id) * 20\
          as sum from free_board\
          left join free_comment\
          on free_board.post_id = free_comment.post_id\
          left join free_like\
          on free_board.post_id = free_like.post_id\
          group by free_board.post_id;",
          { type: Sequelize.QueryTypes.SELECT }
        );
    ```

    1. 반복문 안에 create 사용하여 집계된 게시글 DB에 저장하였으나, 성능 개선을 위해 `bulkCreate` 적용.
    → `bulkCreate` 란? Object Array를 테이블의 row에 맞춰 자동으로 생성

    1. 2차 쿼리문, 함수 개선

    ```jsx
    const calculateIssue = async () => {
      let startDate = new Date(); // 기본 24시간 설정 변수
      startDate.setDate(startDate.getDate() - 1);
      let endDate = new Date(); // 최대 7일까지 계산하기 위한 변수
      endDate.setDate(endDate.getDate() - 7);
      let result = [];
      while (result.length < 4) {
        result = await sequelize.query(
          `select free_board.post_id,
          free_board.user_id,
          free_board.view_count
          + count(distinct free_comment.user_id) * 10
          + count(distinct free_like.user_id) * 10
          as sum from free_board 
          left join free_comment
          on free_board.post_id = free_comment.post_id
          left join free_like
          on free_board.post_id = free_like.post_id
          WHERE free_board.createdAt BETWEEN 
          '${startDate.toISOString().slice(0, 19).replace("T", " ")}' AND NOW()
          group by free_board.post_id;`,
          { type: Sequelize.QueryTypes.SELECT }
        );
        // 인기 게시글 집게가 되지 않을 경우, 집계 기간을 늘려감.
        startDate.setHours(startDate.getHours() - 1);
        if (startDate < endDate) break;
      }
      return result;
    };
    ```

    24시간 내에 네개 이하의 글이 존재한다면, 메인페이지에 4개가 표현되는 인기 게시글을 표시가 불가능해 짐.

    시작 시간을 변수에 지정하고 ( 24시간 )

    글 검색 결과가 4개 이상이 나올떄까지 반복하여 시간을 증가하며 검색 ( 최대7일 )
    
    

### 이미지 처리
    
    ![image](https://user-images.githubusercontent.com/81303869/132342039-087d80fd-39c1-4992-8010-4a989a5a4e87.png)

    ```jsx
    const cleanUp = async (req, res, next) => {
      try {
        const freeImages = await utilService.findAllPost("free");
        const univImages = await utilService.findAllPost("univ");
        const candidateImages = await utilService.findAllCandidate();

        const useImages = freeImages.concat(univImages, candidateImages);

        const publicFolder = "./public/";
        const savedImages = fs.readdirSync(publicFolder);

        // 프런트에서 랜덤생성된 이미지 이름에 /를 붙여 보내기에, /붙이는 처리하며 삭제할 이미지 조회
        const findDeleteImg = savedImages.filter(
          (x) => !useImages.includes("/" + x)
        );

        for (let i = 0; i < findDeleteImg.length; i++) {
          fs.unlinkSync(appDir + "/public/" + findDeleteImg[i]);
          console.log(`${findDeleteImg[i]} 삭제 되었습니다.`);
        }
      } catch (err) {
        console.error(err);
      }
    };
    ```
    
    
    
### Jenkins 자동 배포

1차 배포 후 각종 버그 수정, 프런트와의 기능 수정 사항들이 넘쳐나고
잦은 배포로 인한 시간소모가 상당하다는것을 인지하여 CI/CD 구축하기로 결정
그 결과, 시간적 물리적 편의성의 확보되었으며, 나아가 제스트 라이브러리를 사용하여 젠킨스와 연동, 테스트 자동화까지 구현.

![image](https://user-images.githubusercontent.com/81303869/132342142-f1c2e047-66c1-42db-86fc-e02c36e06042.png)



 ### MVC Pattern



 ### 예외처리


## 6. 최종 성과
2021 / 09 / 03 기준
![image](https://user-images.githubusercontent.com/81303869/132345093-40133d36-d847-4b3a-9299-1fc614ec0086.png)

![image](https://user-images.githubusercontent.com/81303869/132345197-a3af1843-460f-4ca9-b018-8f9d1affdb21.png)
광고 게시 나흘간 538회의 게시글 참여가 발생
80명의 실제 가입과 대학 인증
127개의 게시글 작성

대학 게시판 조회수보다 1.2배 많은 투표함 조회수.
한인회 회장 선거 시, 일원화된 선거 기능을 제공하는 곳이 없다는 점을 기획 단계부터 고려하였고
선거 기능을 서비스로 제공하려는 기획이 적중한 결과라 생각.
