![](https://images.velog.io/images/42seouler/post/2fee79fc-fa64-42cd-89f5-f71c4c26818a/image.png)
## Required
------------
#### 구현 방법과 이유
1.유저의 생성, 인가, 인증 구현 방법 [NestJS 공식 인증문서](https://docs.nestjs.com/security/authentication)를 참고해서
Passport를 사용해서 유저의 인가, 인증을 구현했습니다. JWT 만료시간은 테스트를 위해 10분으로 해두었고 유저의 생성으로 문서에 관해 인가 되었다고 가정했습니다.

2.useGuards 데코레이터를 사용해서 인증 된 유저만 글 생성,수정,삭제가 가능하도록 했습니다.
또한 인증객체의 아이디와 문서의 아이디가 일치한 경우(본인의 글에 관해서만)수정, 삭제 가능하도록 했습니다.

3.글의 확인, 글의 목록은 별도의 인증없이 글을 확인 할 수 있도록 했습니다.

4.테스트의 편의를 위해 유저 목록은 별도의 인증 없이 제공합니다. 또한 비밀번호는 [NestJs 공식 Hashing문서](https://docs.nestjs.com/security/encryption-and-hashing)를 통해 암호화했고 비밀번호 또한 암호화를 확인하기 위해 같이 제공됩니다.

#### 라이브러리

- class-validator - 입력값의 유효성 확인
- class-transformer - 입력값의 type 변환
- @nestjs/mapped-types - DTO(데이터 전송 개체)
- @nestjs/typeorm typeorm sqlite - sqlite(in memory database)
- @nestjs/config - 환경변수를 .env 파일로 분리
- bcrypt, @types/bcrypt - 비밀번호 암호화
- @nestjs/passport passport passport-local -jwt 로그인
- @types/passport-local -jwt 로그인
- @nestjs/jwt passport-jwt -jwt 로그인
- @types/passport-jwt -jwt 로그인


## Installation
------------
#### 1. 프로젝트 다운로드
```
git clone https://github.com/42seouler/wanted.git
```

#### 2. 패키지 다운로드
```
npm install
```

## Running the app
------------
```
# development
npm run start

# watch mode
npm run start:dev
```

## API SPEC
------------

공개용 API

- 가입: POST http://localhost:3000/user
- 로그인: POST http://localhost:3000/auth/login
- 문서 목록: GET http://localhost:3000/post?limit={number}&offset={number}
- 문서 읽기: GET http://localhost:3000/post/{postId}

로그인 사용자용 API

- 문서 생성: POST http://localhost:3000/post
- 문서 수정: PATCH http://localhost:3000/post/{postId}
- 문서 삭제: DELETE http://localhost:3000/post/{postId}

과제를 위한 편의 API (별도의 인증 절차를 거치지 않음)

- 유저 목록: GET http://localhost:3000/user

---
# 공개용 API
---
## 가입하기
```
curl -X POST http://localhost:3000/user -d '{"username": "wanted", "password": "backend"}' -H "Content-Type: application/json"
```

#### 요청 성공시 (STATUS 201)
```
{"username":"wanted","password":"$2b$10$yugnzsGstW6bBZ/K.jAZHurbhPRW.GoohrV8JofQ7V7tjuJxQx1Oy","userId":1,"createdAt":"2021-10-27T05:14:28.000Z","UpdatedAt":"2021-10-27T05:14:28.000Z"}
```

#### 요청 실패 (STATUS 400)
```
{
  "statusCode": 400,
  "message": [
    "password should not be empty",
    "password must be a string"
  ],
  "error": "Bad Request"
}
```
---

## 로그인
```
curl -X POST http://localhost:3000/auth/login -d '{"username": "wanted", "password": "backend"}' -H "Content-Type: application/json"

```

#### 로그인 성공시(STATUS 200)
```
{"access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IndhbnRlZCIsInN1YiI6MSwiaWF0IjoxNjM1MzEzNzg1LCJleHAiOjE2MzUzMTM4NDV9.JGWXY1SgBEZ7Jds2Jhll-hDF1nf6RzqtcPidNIxOsEM"}
```

#### 요청 실패(STATUS 401)
```
{"statusCode":401,"message":"Unauthorized"}
```
---
## 문서 목록
```
curl http://localhost:3000/post?limit=3&offset=0
```
- limit : 가져 올 element 요소의 수
- offset : page 번호 (0부터 시작함)

#### 요청 성공(STATUS 200)
- totalElements : 전체 레코드의 수
- totalPage : 페이지의 수
- pageSize : request param limit과 동일
- offset : request param offset과 동일
```
{
  "pageable": {
    "totalElements": 7,
    "totalPage": 2,
    "pageSize": 3,
    "offset": "0"
  },
  "data": [
    {
      "id": 1,
      "title": "test",
      "author": "wanted",
      "content": "test",
      "createdAt": "2021-10-27T05:58:47.000Z",
      "UpdatedAt": "2021-10-27T05:58:47.000Z"
    },
    {
      "id": 2,
      "title": "john",
      "author": "wanted",
      "content": "changeme",
      "createdAt": "2021-10-27T06:01:11.000Z",
      "UpdatedAt": "2021-10-27T06:01:11.000Z"
    },
    {
      "id": 3,
      "title": "wanted",
      "author": "wanted",
      "content": "wanted wecode pre onboarding course",
      "createdAt": "2021-10-27T06:01:45.000Z",
      "UpdatedAt": "2021-10-27T06:01:45.000Z"
    }
  ]
}
```

#### 요청 실패(STATUS 400)
```
{
  "statusCode": 400,
  "message": [
    "limit must be a positive number",
    "offset must be a positive number"
  ],
  "error": "Bad Request"
}
```
---
## 문서 읽기
```
curl http://localhost:3000/post/{postId}
```

#### 요청 성공(STATUS 200)
```
{"id":3,"title":"wanted","author":"wanted","content":"wanted wecode pre onboarding course","createdAt":"2021-10-27T06:01:45.000Z","UpdatedAt":"2021-10-27T06:01:45.000Z"}
```

#### 요청 실패(STATUS 404) - 존재하지 않는 문서
```
{
  "statusCode": 404,
  "message": "Post #99 not found",
  "error": "Not Found"
}
```

# 로그인 사용자용 API
---

## 문서 생성
```
curl -X POST http://localhost:3000/post -d '{"title": "wanted", "content": "wanted wecode pre onboarding course"}' -H "Content-Type: application/json" -H "Authorization: Bearer {token}"

```
#### 요청 성공시(STATUS 201)
```
{"title":"wanted","content":"wanted wecode pre onboarding course","author":"wanted","id":6,"createdAt":"2021-10-27T06:14:55.000Z","UpdatedAt":"2021-10-27T06:14:55.000Z"}
```

#### 요청 실패(STATUS 401) - 잘못된 토큰
```
{"statusCode":401,"message":"Unauthorized"}
```

#### (STATUS 400) - 필드값 누락
```
{"statusCode":400,"message":["content should not be empty","content must be a string"],"error":"Bad Request"}
```
---

## 문서 수정
```
curl -X PATCH http://localhost:3000/post/{postId} -d '{"title": "원티드", "content":"백엔드 위코드 백엔드 코스"}' -H "Content-Type: application/json" -H "Authorization: Bearer {token}"
```

#### 요청 성공(STATUS 200)
```
{"id":4,"title":"원티드","author":"wanted","content":"백엔드 위코드 백엔드 코스","createdAt":"2021-10-27T06:12:08.000Z","UpdatedAt":"2021-10-27T06:46:37.000Z"}
```

#### 요청 실패(STATUS 400) - 잘못된 필드
```
{
  "statusCode": 400,
  "message": [
    "property titlde should not exist",
    "property contdnt should not exist"
  ],
  "error": "Bad Request"
}
```

#### 요청 실패(STATUS 400) - 작성자가 아닌 사람이 수정 할 때
```
{"statusCode":400,"message":"게시글은 작성자만 수정 할 수 있습니다.","error":"Bad Request"}
```

#### 요청 실패(STATUS 401) - 잘못된 토큰
```
{"statusCode":401,"message":"Unauthorized"}
```
---
## 문서 삭제
```
curl -X DELETE http://localhost:3000/post/{postId} -H "Authorization: Bearer {token}"

```

#### 요청 성공(STATUS 200)
- 삭제 성공시 삭제 된 문서를 돌려줌
```
{
  "title": "wanted",
  "author": "wanted",
  "content": "wanted wecode pre onboarding course",
  "createdAt": "2021-10-27T06:01:45.000Z",
  "UpdatedAt": "2021-10-27T06:01:45.000Z"
}
```

#### 요청 실패(STATUS 400) - 존재하지 않는 문서
```
{
  "statusCode": 404,
  "message": "Post #99 not found",
  "error": "Not Found"
}
```

#### 요청 실패(STATUS 400) - 작성자가 아닌 사람이 삭제 할 때
```
{"statusCode":400,"message":"게시글은 작성자만 삭제 할 수 있습니다.","error":"Bad Request"}
```

#### 요청 실패(STATUS 401) - 잘못된 토큰
```
{"statusCode":401,"message":"Unauthorized"}
```

# 과제를 위한 편의 API

## 유저 목록
```
curl http://localhost:3000/user
```

#### 요청 성공(STATUS 200)
- 비밀번호는 hash 처리되어 있으며 편의상 함께 제공
```
[
  {
    "userId": 1,
    "username": "wanted",
    "password": "$2b$10$yugnzsGstW6bBZ/K.jAZHurbhPRW.GoohrV8JofQ7V7tjuJxQx1Oy",
    "createdAt": "2021-10-27T05:14:28.000Z",
    "UpdatedAt": "2021-10-27T05:14:28.000Z"
  },
  {
    "userId": 2,
    "username": "nakim",
    "password": "$2b$10$hvOhUWWBRV/KVEcR1lsfaeg.AX7Mgprw5uiI9gX88rzo5KVXTx9LW",
    "createdAt": "2021-10-27T05:16:31.000Z",
    "UpdatedAt": "2021-10-27T05:16:31.000Z"
  }
]
```



