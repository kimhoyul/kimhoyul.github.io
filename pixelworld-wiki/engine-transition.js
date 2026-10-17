/* Published engine decision and user-led implementation status. */
(function(global){
  'use strict';
  const date='2026-10-17';
  const status='사용자 직접 구현 준비';
  const decision={id:'engine-decision',title:'엔진 결정 — Unreal + C++',group:'프로젝트',status:'확정',order:1,createdAt:date,updatedAt:date,description:'언리얼 전환 결정과 사용자 직접 구현 방식',body:`# 엔진 결정 — Unreal Engine + C++

**개발 엔진:** Unreal Engine 5

**핵심 언어:** C++

**진행 상태:** 엔진 전환 확정 / 사용자 직접 구현 준비

## 진행 방식

사용자가 직접 코드를 작성한다. AI는 한 단계씩 목적, 설계, 작성 위치, 필요한 코드와 확인 방법을 설명하고 사용자의 결과를 확인한다.

## 개발 기준

게임플레이는 Unreal C++을 중심으로 구성하고, 콘텐츠 설정과 UI 연결에는 Blueprint 및 데이터 에셋을 활용한다. 세계의 식별·영속 상태·시뮬레이션 코어는 엔진 독립 구조로 설계한다.

| 계층 | 계획 |
|---|---|
| Unreal 클라이언트 | 그래픽, 입력, 캐릭터, 전투 표현 |
| 지역 서버 | 이동·전투 판정, 주변 상태 동기화 |
| World Core | 세계 식별자, 시간, NPC·경제 상태 |
| 저장 계층 | PostgreSQL 기반 영구 상태 |
| 지리 파이프라인 | GIS 원본 + 생성 규칙 + 변경 상태 |

## 현재 기록

AI가 직전에 추가했던 C++ 구현, 빌드 설정, 테스트와 검증 보고서는 사용자 요청에 따라 현재 main에서 삭제했다. Unreal Engine + C++ 선택과 기획은 유지한다.

## 다음 순서

설치된 Unreal 버전 확인 → 프로젝트 생성 안내 → World Identity 데이터 모델 → 지역 생성 → 영속 상태와 공유 세계.

## 개발 난도

1은 쉬움, 10은 어려움. 작업량 비교용 추정치다.

| 작업 | 난도 |
|---|---:|
| 독립 C++ 데이터 코어 | 5/10 |
| Unreal 모듈·테스트 연결 | 6/10 |
| 작은 지역의 생성·재방문 | 6/10 |
| GIS 구형 행성·스트리밍 | 9/10 |
| 지역 분할 공유 세계 | 10/10 |

## 유지하는 기획

실제 지구 기반 약 255,000,000km²의 공유 세계, 탐험·개인 성장·세력 확장, 3D 픽셀 스타일, 붉은사막식 다대일 전투, 스텔라 블레이드식 패링·밸런스·결정타, 마법 회피를 유지한다. 발헤임과 붉은사막은 월드 생성·관리 레퍼런스다.

## 관련 문서

- [[world-foundation|World Foundation 구현 계획]]
- [[world-engine|월드 생성 기술]]
- [[world-simulation|세계 시뮬레이션]]
- [[home|PixelWorld]]`};
  const foundation={id:'world-foundation',title:'World Foundation — 구현 계획',group:'개발·기록',status:'설계 중',order:29,createdAt:date,updatedAt:date,description:'사용자가 직접 만드는 P0-1 데이터 모델과 단계별 안내',body:`# World Foundation — 구현 계획

**구현 항목:** P0-1 — World Identity & Data Model

**진행 상태:** 사용자 직접 구현 준비

**목표:** 세계·지역·개체의 안정적인 식별자와 영구 저장의 기반을 만든다.

## 진행 방식

목적과 설계 설명 → 사용자가 코드 작성 → 실행 결과 확인 → 다음 단계로 진행한다.

## 설계할 데이터

| 구성 | 역할 |
|---|---|
| WorldId | 생성 시드와 별개인 세계 식별자 |
| RegionId | 시뮬레이션과 저장을 위한 논리 지역 |
| TileId | 지형 생성·스트리밍의 공간 주소 |
| EntityId | 나무·NPC·건물의 영속 식별자 |
| WorldDefinition | 시드와 생성기·지리 데이터 버전 |
| WorldState | 시간과 변경 가능한 세계 상태 |

## 설계 기준

논리 Region과 지형 LOD를 분리한다. 화면의 Actor와 영속 EntityId를 구분한다. 저장 형식과 생성 규칙은 버전으로 관리한다. 타입과 직렬화 세부 사항은 구현하면서 함께 정한다.

## 현재 기록

AI가 직전에 추가한 C++ 코드, 빌드 설정, 테스트와 검증 보고서를 사용자 요청에 따라 삭제했다. 이 문서는 앞으로 사용자와 진행할 구현 계획이다.

## 단계별 순서

| 단계 | 안내 내용 |
|---|---|
| 프로젝트 준비 | 설치 버전 확인과 Unreal 프로젝트 생성 |
| P0-1 | WorldId·RegionId·TileId·EntityId와 데이터 모델 |
| P0-2 | 64m × 64m 시험 지역의 나무 20그루 생성 |
| P0-3 | 벌목 변경 상태 저장·복원 |
| P0-4 | 시간·NPC·생산·소비 |
| P0-5 | 지역 로드·언로드와 상태 복원 |
| P0-6 | 여러 플레이어의 자원 상태 공유 |

## 월드 생성 레퍼런스

발헤임과 붉은사막을 함께 참고한다. GIS 기반 지형, 바이옴별 배치, 지역 스트리밍과 영속 상태를 연결한다. [[world-engine|월드 생성 기술]]에서 설계를 관리한다.

## 관련 문서

- [[engine-decision|엔진 결정 — Unreal + C++]]
- [[world-engine|월드 생성 기술]]
- [[world-simulation|세계 시뮬레이션]]
- [[mvp|개발 및 MVP]]`};
  function upsert(data,page,baseline){
    const current=data.pages.find(p=>p.id===page.id);
    if(!current){data.pages.push(structuredClone(page));return;}
    // Keep an explicit backup of local drafts before replacing obsolete generated reports.
    if(current.body!==page.body && current.body!==baseline.get(page.id)?.body){
      data.guidedDevelopmentBackups=data.guidedDevelopmentBackups||{};
      if(!data.guidedDevelopmentBackups[page.id])data.guidedDevelopmentBackups[page.id]=structuredClone(current);
    }
    Object.assign(current,structuredClone(page));
  }
  function apply(data,baseline){
    if(!data||!Array.isArray(data.pages))throw new Error('위키 문서 형식 오류');
    if(data.engineTransitionVersion===2)return data;
    const originals=new Map((baseline?.pages||[]).map(p=>[p.id,p]));
    upsert(data,decision,originals);upsert(data,foundation,originals);
    const home=data.pages.find(p=>p.id==='home');
    if(home){
      home.body=home.body.replace('| 개발 엔진 | Unity |','| 개발 엔진 | **Unreal Engine 5 + C++** |')
        .replace(/\| 개발 단계 \|[^\n]*\|/,'| 개발 단계 | '+status+' |')
        .replace(/\*\*P0-1 World Identity & Data Model\*\*[^\n]*/,'**P0-1 World Identity & Data Model** — 사용자가 직접 구현하며 AI가 단계별로 안내한다.')
        .replace('[[factions|세력과 군단]] — 유지 여부 미확정','[[factions|세력과 군단]] — 세력 확장 확정 / 군단 구조 설계');
      if(!home.body.includes('[[engine-decision|'))home.body=home.body.replace('## 기획 문서','## 기획 문서\n\n- [[engine-decision|엔진 결정 — Unreal + C++]] — 엔진 선택과 진행 방식');
      home.updatedAt=date;
    }
    for(const id of ['world-engine','world-simulation','mvp','village-mvp']){
      const p=data.pages.find(p=>p.id===id);if(!p)continue;
      p.body=p.body.replace(/순수 C#/g,'엔진 독립 C++').replace(/UnityEngine에 독립적인/g,'엔진 타입과 독립적인')
        .replace(/Unity의 GameObject가 아니라/g,'렌더링용 Actor 대신').replace(/엔진 결정과 C\+\+ 이식 결과/g,'엔진 결정과 진행 방식');
      if(!p.body.includes('[[engine-decision|')){
        const n=p.body.indexOf('\n');
        p.body=p.body.slice(0,n)+'\n\n**현재 개발 기준:** Unreal Engine + C++. [[engine-decision|엔진 결정과 진행 방식]]'+p.body.slice(n);
      }
      if(id==='mvp')p.body=p.body.replace(/\*\*상태: (?:코드 구현 완료 \/ Unity 검증 대기\.|C\+\+ 코드 구현·독립 테스트 완료\.)\*\*[^\n]*/,'**상태: 사용자 직접 구현 준비.** AI가 각 단계의 목적과 작성·확인 방법을 안내한다.');
      p.updatedAt=date;
    }
    const history=data.pages.find(p=>p.id==='history');
    if(history){
      history.body=history.body.replace('C++ World Foundation을 이식하고 GCC·Clang 테스트를 완료했다.','직전에 자동으로 추가한 C++ 구현과 검증 파일은 이후 사용자 요청으로 삭제했다.');
      if(!history.body.includes('## 2026-10-17 — 사용자 직접 구현 방식으로 변경')){
        const n=history.body.indexOf('\n');history.body=history.body.slice(0,n)+'\n\n## 2026-10-17 — 사용자 직접 구현 방식으로 변경\n\nUnreal Engine + C++ 전환 결정은 유지한다. AI가 직전에 추가한 C++ 코드·테스트·검증 보고서를 현재 main에서 삭제했다. 앞으로 사용자가 직접 구현하고 AI가 한 단계씩 설명한다. [[engine-decision|엔진 결정과 진행 방식]]\n'+history.body.slice(n);
      }
      history.updatedAt=date;
    }
    data.engineTransitionVersion=2;return data;
  }
  global.applyPixelWorldEngineTransition=apply;
})(globalThis);
