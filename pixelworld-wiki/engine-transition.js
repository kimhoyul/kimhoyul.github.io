/* Published engine decision; existing local drafts are preserved on migration. */
(function(global){
  'use strict';
  const date='2026-10-17';
  const commit='040f1150c6c02d27d7d31cbc3e6c72190b0f8599';
  const code='https://github.com/kimhoyul/PixelWorld/tree/'+commit+'/Native/WorldFoundation';
  const decision={id:'engine-decision',title:'엔진 결정 — Unreal + C++',group:'프로젝트',status:'확정',order:1,createdAt:date,updatedAt:date,description:'언리얼 전환 결정, C++ 월드 코어, 이관 순서와 개발 난도',body:`# 엔진 결정 — Unreal Engine + C++

**결정일:** 2026-10-17

**개발 엔진:** Unreal Engine 5

**핵심 언어:** C++

**진행 상태:** 엔진 전환 확정 / C++ 데이터 코어 이식·독립 테스트 완료

## 개발 기준

언리얼을 현재 개발 엔진으로 확정한다. 핵심 게임플레이는 C++로, 콘텐츠 설정과 UI 연결은 Blueprint 및 데이터 에셋으로 구성한다. 세계의 식별·영속 상태·경제 시뮬레이션 코어는 엔진과 독립적인 C++로 유지한다.

| 계층 | 책임 |
|---|---|
| Unreal 클라이언트 | 그래픽, 카메라, 입력, 캐릭터, 전투 표현 |
| 실시간 지역 서버 | 이동·충돌·전투 판정 및 관심 영역 동기화 |
| C++ World Core | 세계 ID, 상태, 논리 시간, 지역·NPC·경제 |
| 저장 계층 | PostgreSQL 기반 영구 상태와 주요 사건 |
| 지리 파이프라인 | GIS 원본 + 생성 규칙 + 변경 데이터 |

## 월드 제작과 처리

World Partition·Landscape·HLOD·PCG·Mass의 활용 범위는 지역 프로토타입에서 검증한다. 행성의 전역 좌표, 고정 Region 주소, 구면 지형은 PixelWorld의 별도 월드 계층에서 관리한다. 실시간 Actor와 저장용 EntityId는 분리한다.

## C++ 이식 결과

WorldId, RegionId, TileId, EntityId, WorldDefinition, WorldState와 PWF1 스냅샷 코덱을 C++17로 옮겼다. 기존 C# GUID 바이트 순서, 절차 ID 해시 입력, 정수·문자열 저장 형식을 유지했다.

GCC 14.2 / Clang 17(Linux)에서 각각 165 assertions와 비정상 스냅샷 입력 10,000건을 통과했다. Clang ASan/UBSan 검사 및 독립 Python 기준 절차 ID 256개 비교도 통과했다. Unreal Editor/MSVC 및 C# 런타임 실행 검증은 별도 상태다.

[C++ 코드와 테스트](${code})

## 다음 작업

설치된 Unreal Engine 버전 확인 → C++ 프로젝트·WorldFoundation 모듈 구성 → 엔진 내 ID·저장 테스트 → 64m × 64m 지역의 나무 20그루 생성.

## 개발 난도

1은 쉬움, 10은 어려움. 작업량을 비교하기 위한 추정치다.

| 작업 | 난도 |
|---|---:|
| 독립 C++ 데이터 코어 | 5/10 |
| Unreal 모듈·테스트 연결 | 6/10 |
| 작은 지역의 생성·재방문 | 6/10 |
| GIS 구형 행성·스트리밍 | 9/10 |
| 지역 분할 공유 세계 | 10/10 |

## 유지하는 기획

실제 지구 기반 약 255,000,000km²의 공유 세계, 탐험·개인 성장·세력 확장, 3D 픽셀 스타일, 붉은사막식 다대일 전투, 스텔라 블레이드식 패링·밸런스·결정타와 마법 회피를 유지한다. 발헤임·붉은사막은 월드 생성과 관리 레퍼런스로 사용한다.

## 관련 문서

- [[world-foundation|World Foundation]]
- [[world-engine|월드 생성 기술]]
- [[world-simulation|세계 시뮬레이션]]
- [[home|PixelWorld]]`};
  const foundation={id:'world-foundation',title:'World Foundation — C++ 기반',group:'개발·기록',status:'설계 중',order:29,createdAt:date,updatedAt:date,description:'P0-1 C++ 데이터 기반 구현·테스트 결과 및 Unreal 연동',body:`# World Foundation — C++ 기반

**구현 항목:** P0-1 — World Identity & Data Model

**진행 상태:** C++ 구현·독립 빌드 검증 완료 / Unreal 연결 대기

**목표:** 세계·지역·개체의 안정적인 식별자와 영구 저장의 기반을 유지한다.

## 현재 코드

[Native/WorldFoundation](${code})

| 구성 | 구현 |
|---|---|
| WorldId | Seed와 독립적인 128비트 세계 식별자 |
| RegionId | WorldId 안에서 고유한 UInt64 논리 지역 |
| TileId | Face / Level / X / Y 구면 타일 주소 |
| EntityId | 절차 생성 ID와 서버 발급 ID의 저장 타입 |
| WorldDefinition | Seed, 생성기 버전, 지리 데이터 버전 |
| WorldState | 현재 Tick, Revision, 단조 증가 검사 |
| Encode / Decode | PWF1 v1 바이너리 스냅샷 |

## 식별과 저장

Region과 Tile LOD를 분리한다. Actor의 생성·제거와 관계없이 EntityId를 유지한다. 동적 ID는 서버의 GUID 할당기에서 발급하며 C++ 코어는 입력 값을 검증한다.

기존 C#의 GUID 바이트 순서와 SHA-256 생성 입력을 보존했다. 정수는 명시적 little-endian, 문자열은 7비트 길이 + UTF-8로 저장한다. 생성기 버전과 안정적인 스폰 주소는 영속 세계의 재현 기준이다.

실패는 optional/bool로 반환한다. 코어는 Unreal 타입을 사용하지 않는 C++17 표준 라이브러리 기반이다.

## 검증 결과

| 검사 | 결과 |
|---|---|
| GCC 14.2 빌드·CTest | 통과 |
| Clang 17 빌드·CTest | 통과 |
| ID·스냅샷·경계값 165 assertions | 각 컴파일러 통과 |
| 비정상 스냅샷 10,000건 | 각 컴파일러 처리 확인 |
| Clang ASan / UBSan | 통과 |
| 독립 Python 기준 절차 ID 256개 | 각 컴파일러 일치 |
| Unreal Editor / Windows MSVC | 확인 대기 |

[검증 보고서](https://github.com/kimhoyul/PixelWorld/blob/${commit}/Validation/world-foundation-cpp.json)

## 구현 순서

| 단계 | 작업 | 상태 |
|---|---|---|
| P0-1 | C++ World Identity / Data Model | 독립 테스트 통과 |
| Unreal 연결 | 프로젝트·모듈·엔진 테스트 | 설치 버전 확인 후 진행 |
| P0-2 | 64m × 64m 시험 지역의 나무 20그루 | 다음 생성 작업 |
| P0-3 | 벌목 델타 저장·복원 | 후속 |
| P0-4 | 시간·NPC·생산·소비 | 후속 |
| P0-5 | 지역 로드·언로드와 상태 복원 | 후속 |
| P0-6 | 두 클라이언트의 자원 동기화 | 후속 |

## 월드 생성 레퍼런스

발헤임과 붉은사막을 함께 참고한다. 지구 GIS로 기본 지형을 구성하고, 생성 시드·바이옴별 환경 배치·지역 스트리밍·영속 변경 상태를 연결한다. [[world-engine|월드 생성 기술]]에서 상세 설계를 관리한다.

## 관련 문서

- [[engine-decision|엔진 결정 — Unreal + C++]]
- [[world-engine|월드 생성 기술]]
- [[world-simulation|세계 시뮬레이션]]
- [[mvp|개발 및 MVP]]`};
  function apply(data,baseline){
    if(!data||!Array.isArray(data.pages))throw new Error('위키 문서 형식 오류');
    if(data.engineTransitionVersion===1)return data;
    const originals=new Map((baseline?.pages||[]).map(p=>[p.id,p]));
    let p=data.pages.find(p=>p.id==='engine-decision');
    if(!p)data.pages.push(structuredClone(decision));
    const f=data.pages.find(p=>p.id==='world-foundation');
    if(!f)data.pages.push(structuredClone(foundation));
    else if(f.body===originals.get(f.id)?.body)Object.assign(f,structuredClone(foundation));
    else if(f.body!==foundation.body && !f.body.startsWith('> 현재 엔진은 Unreal + C++')) {
      // Preserve an edited local draft and prepend the current published state.
      f.body='> 현재 엔진은 Unreal + C++이며 C++ 데이터 기반은 독립 테스트를 통과했다. [[engine-decision|엔진 결정 및 최신 코드]]를 참고.\n\n'+f.body;
      f.updatedAt=date;
    }
    const h=data.pages.find(p=>p.id==='home');
    if(h){
      h.body=h.body.replace('| 개발 엔진 | Unity |','| 개발 엔진 | **Unreal Engine 5 + C++** |');
      h.body=h.body.replace(/\| 개발 단계 \|[^\n]*\|/,'| 개발 단계 | C++ 데이터 코어 검증 완료 / Unreal 프로젝트 연결 |');
      h.body=h.body.replace(/\*\*P0-1 World Identity & Data Model\*\*[^\n]*/,'**P0-1 World Identity & Data Model** — C++로 이식하고 독립 빌드·테스트를 통과했다. 다음은 Unreal 프로젝트 연결이다.');
      if(!h.body.includes('[[engine-decision|'))h.body=h.body.replace('## 기획 문서','## 기획 문서\n\n- [[engine-decision|엔진 결정 — Unreal + C++]] — 전환 결정, C++ 기반, 개발 난도');
      h.body=h.body.replace('[[factions|세력과 군단]] — 유지 여부 미확정','[[factions|세력과 군단]] — 세력 확장 확정 / 상세 군단 구조 설계');
      h.updatedAt=date;
    }
    for(const id of ['world-engine','world-simulation','mvp','village-mvp']){
      const page=data.pages.find(p=>p.id===id);if(!page)continue;
      if(!page.body.includes('[[engine-decision|')){
        const n=page.body.indexOf('\n');page.body=page.body.slice(0,n)+'\n\n**현재 개발 기준:** Unreal Engine + C++. [[engine-decision|엔진 결정과 C++ 이식 결과]]'+page.body.slice(n);
      }
      page.body=page.body.replace(/순수 C#/g,'엔진 독립 C++').replace(/UnityEngine에 독립적인/g,'Unreal 타입과 독립적인').replace(/Unity의 GameObject가 아니라/g,'렌더링용 Actor 대신');
      if(id==='mvp')page.body=page.body.replace(/\*\*상태: 코드 구현 완료 \/ Unity 검증 대기\.\*\*[^\n]*/,'**상태: C++ 코드 구현·독립 테스트 완료.** 다음 작업은 Unreal 프로젝트와 모듈 연결이다.');
      page.updatedAt=date;
    }
    const history=data.pages.find(p=>p.id==='history');
    if(history&&!history.body.includes('## 2026-10-17 — Unreal 엔진 전환 확정')){
      const n=history.body.indexOf('\n');history.body=history.body.slice(0,n)+'\n\n## 2026-10-17 — Unreal 엔진 전환 확정\n\nUnreal Engine 5 + C++을 개발 기준으로 확정했다. C++ World Foundation을 이식하고 GCC·Clang 테스트를 완료했다. Unity 파일은 이관 참고본으로 보존한다. [[engine-decision|엔진 결정]]\n'+history.body.slice(n);
      history.updatedAt=date;
    }
    data.engineTransitionVersion=1;return data;
  }
  global.applyPixelWorldEngineTransition=apply;
})(globalThis);
