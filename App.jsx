"use client";
import React, { useState, useMemo, useEffect } from 'react';

// 👇 선생님의 구글 시트 앱스 스크립트(웹앱) URL (그대로 유지)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwKsfQKW-END2xPOr25Dhcqvs9_Z_2lXAKCzjtiQ7J2wL6qzBclSy6dP-XKK_dCFgoF/exec";

// 🏫 학급 및 학생 명단 데이터
const classData = {
  "중 1-1": ["강나림", "김용재", "김은혜", "김태윤", "박청지", "주동현"],
  "중 1-2": ["길도연", "김서준", "문정현", "송오성", "정지운", "추상욱"],
  "중 2-1": ["강건욱", "강준석", "권나희", "김채영", "오승찬", "최은혁"],
  "중 2-2": ["김준우", "김태래", "송승훈", "이정훈", "황선재", "변재원"],
  "중 2-3": ["김소윤", "김예성", "김채은", "신한결", "이동재", "정지안"],
  "중 2-4": ["김도현", "김지훈", "박상현", "원종빈", "이근우", "이주안"],
  "중 3-1": ["김지원", "박현성", "설태현", "정윤호", "김진영", "조영주"],
  "중 3-2": ["손민주", "안다율", "이성찬", "최현웅", "홍성민", "김시은"],
  "중 3-3": ["김나은", "박민준", "박시우", "배채원", "신우성"]
};

// --- 새 퀴즈 데이터 (수업 준비 플로우차트 4지선다형 & 루프) ---
const quizData = [
  {
    id: "step1", 
    category: "[1단계] 쉬는 시간",
    question: "쉬는 시간이 되었습니다. 무엇을 할까요?",
    isBranching: true, 
    options: [
      { id: 1, imageSrc: "", text: "화장실 다녀오기", rationale: "화장실을 선택하셨군요! 올바른 화장실 이용법을 알아볼까요?" },
      { id: 2, imageSrc: "", text: "물 마시기", rationale: "물 마시기를 선택하셨군요! 어떻게 마셔야 할까요?" },
      { id: 3, imageSrc: "", text: "복도에서 휴식하기", rationale: "복도에서 휴식하기를 선택하셨군요!" }
    ]
  },
  {
    id: "restroom",
    category: "[채점] 화장실",
    question: "화장실에서 대소변을 본 후, 꼭 해야 할 바른 행동은 무엇일까요?",
    condition: (answers) => answers.lastChoice === 1,
    hint: "용변을 본 후, 내 몸의 청결을 위해 꼭 해야 할 일을 생각해보세요.",
    options: [
      { id: 1, imageSrc: "", text: "비누를 묻혀 흐르는 물에 손을 깨끗하게 씻는다.", isCorrect: true, rationale: "위생과 전염병 예방을 위해 용변 후에는 잊지 말고 꼭 손을 씻어야 합니다." },
      { id: 2, imageSrc: "", text: "귀찮으니까 손을 씻지 않고 그냥 교실로 빨리 뛰어간다.", isCorrect: false, rationale: "손을 씻지 않으면 세균이 손에 남아있어 건강에 매우 좋지 않습니다." },
      { id: 3, imageSrc: "", text: "물만 살짝 묻히고 수건이나 옷에 쓱쓱 닦아버린다.", isCorrect: false, rationale: "비누를 사용하지 않으면 세균이 제대로 지워지지 않습니다." },
      { id: 4, imageSrc: "", text: "친구에게 물을 튀기며 장난을 치다 교실로 돌아간다.", isCorrect: false, rationale: "화장실에서 물장난을 치면 바닥이 미끄러워져 다칠 위험이 큽니다." }
    ]
  },
  {
    id: "water",
    category: "[채점] 물 마시기",
    question: "물을 마실 때 가장 바른 행동은 무엇일까요?",
    condition: (answers) => answers.lastChoice === 2,
    hint: "깨끗하고 안전하게 물을 마시는 방법을 떠올려보세요.",
    options: [
      { id: 1, imageSrc: "", text: "개인 텀블러나 컵을 이용하여 물을 흘리지 않게 차분히 마신다.", isCorrect: true, rationale: "개인 컵을 사용하면 위생적이고 물을 아낄 수 있습니다." },
      { id: 2, imageSrc: "", text: "정수기 나오는 곳에 입을 대고 바로 마신다.", isCorrect: false, rationale: "정수기에 직접 입을 대면 세균이 번식하여 비위생적입니다." },
      { id: 3, imageSrc: "", text: "정수기 앞에서 친구와 물을 뿌리며 물장난을 친다.", isCorrect: false, rationale: "정수기 앞에서 장난을 치면 다칠 위험이 있고 다른 사람이 물을 마시기 불편합니다." },
      { id: 4, imageSrc: "", text: "바닥에 물을 흘려도 닦지 않고 그냥 돌아간다.", isCorrect: false, rationale: "물을 흘렸다면 미끄러지지 않도록 닦는 것이 모두를 위한 배려입니다." }
    ]
  },
  {
    id: "hallway",
    category: "[분기] 복도 휴식",
    question: "복도에서 어떻게 휴식할 건가요?",
    isBranching: true,
    condition: (answers) => answers.lastChoice === 3,
    options: [
      { id: 1, imageSrc: "", text: "친구 만나기 (대화하기)", rationale: "친구와 대화하는 상황으로 이어집니다." },
      { id: 2, imageSrc: "", text: "혼자 쉬기", rationale: "혼자 차분히 쉬는 상황으로 이어집니다." }
    ]
  },
  {
    id: "talk",
    category: "[채점] 친구와 대화",
    question: "복도에서 친구를 만나 대화할 때 알맞은 행동은 무엇일까요?",
    condition: (answers) => answers.lastChoice === 3 && answers.hallwayChoice === 1,
    hint: "복도는 우리 반뿐만 아니라 학교의 여러 사람이 함께 사용하는 공간입니다.",
    options: [
      { id: 1, imageSrc: "", text: "다른 반에 방해가 되지 않도록 조용하고 다정한 목소리로 대화한다.", isCorrect: true, rationale: "복도는 모두의 공간이므로 다른 사람을 배려하여 조용히 대화해야 합니다." },
      { id: 2, imageSrc: "", text: "복도 끝에서 끝까지 들리도록 아주 큰 소리로 떠든다.", isCorrect: false, rationale: "큰 소리로 떠들면 다른 교실의 수업이나 휴식에 큰 방해가 됩니다." },
      { id: 3, imageSrc: "", text: "복도에서 술래잡기를 하며 쿵쿵 뛰어다닌다.", isCorrect: false, rationale: "복도에서 뛰면 다칠 위험이 매우 높습니다." },
      { id: 4, imageSrc: "", text: "친구와 심한 욕설이나 거친 장난을 하며 논다.", isCorrect: false, rationale: "학교에서는 바르고 고운 말을 써야 하며 거친 장난은 금물입니다." }
    ]
  },
  {
    id: "rest",
    category: "[채점] 혼자 쉬기",
    question: "복도에서 혼자 쉴 때 알맞은 행동은 무엇일까요?",
    condition: (answers) => answers.lastChoice === 3 && answers.hallwayChoice === 2,
    hint: "다른 사람의 통행을 방해하지 않고 편안하게 쉬는 방법을 찾아보세요.",
    options: [
      { id: 1, imageSrc: "", text: "창밖을 보거나 한쪽 벽에 기대어 통행에 방해되지 않게 차분히 쉰다.", isCorrect: true, rationale: "가벼운 휴식과 스트레칭은 다음 수업의 집중력을 높여줍니다." },
      { id: 2, imageSrc: "", text: "복도 한가운데에 대자로 길게 드러누워 잠을 잔다.", isCorrect: false, rationale: "복도 바닥에 눕는 것은 통행을 방해하고 먼지가 많아 건강에 좋지 않습니다." },
      { id: 3, imageSrc: "", text: "지나가는 다른 반 친구들에게 시비를 걸거나 장난을 친다.", isCorrect: false, rationale: "모르는 친구에게 무례하게 행동하면 갈등이 발생할 수 있습니다." },
      { id: 4, imageSrc: "", text: "교실 문을 쾅쾅 열고 닫으며 돌아다닌다.", isCorrect: false, rationale: "주변 사람들을 놀라게 하고 휴식을 방해하는 행동입니다." }
    ]
  },
  {
    id: "checkLoop",
    category: "[분기] 교실 복귀",
    question: "볼일을 마치고 교실로 돌아왔습니다. 쉬는 시간 할 일을 다 했나요?",
    isBranching: true,
    options: [
      { id: 1, imageSrc: "", text: "아니요, 아직 볼일이 남았어요.", rationale: "다시 쉬는 시간 처음으로 돌아가 다른 할 일을 선택합니다." },
      { id: 2, imageSrc: "", text: "네, 할 일을 다 했어요.", rationale: "이제 다음 시간표를 확인하는 단계로 넘어갑니다." }
    ]
  },
  {
    id: "checkTimetable",
    category: "[3단계] 수업 확인",
    question: "다음 시간표를 확인했습니다. 다음 시간은 어떤 수업인가요?",
    isBranching: true,
    condition: (answers) => answers.loopFinished === true, 
    options: [
      { id: 1, imageSrc: "", text: "교실 수업 (우리 반 교실)", rationale: "우리 교실에서 그대로 수업하는 상황으로 진행합니다." },
      { id: 2, imageSrc: "", text: "교과교실 수업 (과학실, 음악실 등 이동)", rationale: "다른 교실로 이동해서 수업하는 상황으로 진행합니다." }
    ]
  },
  {
    id: "classroomPrep",
    category: "[채점] 교실 수업 준비",
    question: "다음 시간이 '교실 수업'입니다. 알맞은 준비 행동은 무엇일까요?",
    condition: (answers) => answers.loopFinished === true && answers.classType === 1,
    hint: "선생님이 들어오셨을 때 바로 수업을 시작할 수 있게 내 책상을 어떻게 해야 할지 생각해보세요.",
    options: [
      { id: 1, imageSrc: "", text: "해당 교과목을 확인하고, 책상 위에 교과서와 필기도구를 꺼내 둔다.", isCorrect: true, rationale: "수업에 필요한 교재를 미리 꺼내 두면 빠르고 원활하게 수업을 시작할 수 있습니다." },
      { id: 2, imageSrc: "", text: "수업과 상관없는 장난감이나 만화책을 책상 위에 그대로 둔다.", isCorrect: false, rationale: "수업과 무관한 물건은 가방이나 서랍에 꼭 넣어야 수업에 집중할 수 있습니다." },
      { id: 3, imageSrc: "", text: "책상 위를 텅 비워두고 엎드려 계속 잠을 잔다.", isCorrect: false, rationale: "책을 미리 꺼내놓지 않으면 수업 시작 시 허둥지둥하게 됩니다." },
      { id: 4, imageSrc: "", text: "다른 친구의 교과서를 허락 없이 가져와 내 책상에 둔다.", isCorrect: false, rationale: "자신의 물건은 스스로 챙겨야 하며, 남의 물건을 함부로 만지면 안 됩니다." }
    ]
  },
  {
    id: "moveClassPrep",
    category: "[채점] 교과교실 이동",
    question: "다음 시간이 과학실, 음악실 같은 '교과교실 수업'입니다. 알맞은 행동은 무엇일까요?",
    condition: (answers) => answers.loopFinished === true && answers.classType === 2,
    hint: "어느 교실로 가야 하는지, 무엇이 필요한지 먼저 생각해보세요.",
    options: [
      { id: 1, imageSrc: "", text: "이동할 교실을 확인하고, 수업 준비물을 챙겨서 조용히 이동한다.", isCorrect: true, rationale: "이동 수업 시에는 목적지를 알고 준비물을 챙겨가는 책임감이 필요합니다." },
      { id: 2, imageSrc: "", text: "어디로 가는지도 모른 채 준비물 없이 무작정 앞 친구만 따라간다.", isCorrect: false, rationale: "목적지와 준비물을 스스로 챙기지 않으면 수업 시간에 지장을 주게 됩니다." },
      { id: 3, imageSrc: "", text: "가기 싫다며 우리 반 교실에 혼자 남아 있는다.", isCorrect: false, rationale: "정해진 수업 장소로 이동하지 않으면 무단결과 처리될 수 있습니다." },
      { id: 4, imageSrc: "", text: "이동하면서 친구와 큰 소리로 장난을 치며 다른 반을 방해한다.", isCorrect: false, rationale: "이동 중에는 다른 학급의 수업을 방해하지 않도록 조용히 이동해야 합니다." }
    ]
  },
  {
    id: "finalBell",
    category: "[채점] 4단계: 마무리",
    question: "딩동댕동~ 수업 시작 종이 울렸습니다! 나의 마지막 행동으로 가장 바른 것은 무엇일까요?",
    condition: (answers) => answers.loopFinished === true,
    hint: "플로우차트의 가장 마지막에 적힌 핵심 행동을 떠올려보세요.",
    options: [
      { id: 1, imageSrc: "", text: "차분히 자리에 앉아서 선생님을 맞이할 준비를 한다.", isCorrect: true, rationale: "종이 울리면 모든 활동을 멈추고 자리에 바르게 앉아 수업을 준비하는 것이 기본 예절입니다." },
      { id: 2, imageSrc: "", text: "종이 울려도 자리에 앉지 않고 친구와 계속 돌아다닌다.", isCorrect: false, rationale: "종소리는 '수업의 시작'을 의미하므로 즉시 하던 행동을 멈추고 자리에 앉아야 합니다." },
      { id: 3, imageSrc: "", text: "종소리가 안 들리는 척하며 화장실로 늦게 뛰어간다.", isCorrect: false, rationale: "쉬는 시간에 미리 화장실을 다녀와야 하며, 지각은 수업에 방해가 됩니다." },
      { id: 4, imageSrc: "", text: "수업이 시작되었는데도 책을 꺼내지 않고 옆 친구와 떠든다.", isCorrect: false, rationale: "선생님을 기다리는 동안 조용히 책을 펴고 마음의 준비를 해야 합니다." }
    ]
  }
];

const GlobalStyle = () => (
  <style>{`
    html, body, #root {
      width: 100% !important;
      min-height: 100vh !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      display: block !important;
    }
  `}</style>
);

export default function App() {
  const [started, setStarted] = useState(false);
  const [currentQuestionObj, setCurrentQuestionObj] = useState(quizData[0]); 
  
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finished, setFinished] = useState(false);

  // 📝 학생 정보 상태
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  
  // 📝 복잡한 분기(루프) 추적을 위한 상태 객체
  const [sessionAnswers, setSessionAnswers] = useState({
    lastChoice: null,     
    hallwayChoice: null,  
    loopFinished: false,  
    classType: null,      
    채점기록: [],
    completedStep1Choices: [] // 이미 선택한 할 일 추적 배열
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [displayOptions, setDisplayOptions] = useState([]);

  // 🔀 보기를 필터링(제외) 및 무작위 섞기 해주는 헬퍼 함수
  const generateOptions = (questionObj, currentAnswers) => {
    if (!questionObj) return [];
    let opts = [...questionObj.options];

    // [핵심 로직 1] 1단계: 이미 완료한 활동 필터링 제외
    if (questionObj.id === "step1") {
      opts = opts.filter(o => !currentAnswers.completedStep1Choices.includes(o.id));
    }

    // [핵심 로직 2] 3가지 할 일을 모두 마쳤으면 "아니요" 옵션 강제 제거 (루프 탈출)
    if (questionObj.id === "checkLoop" && currentAnswers.completedStep1Choices.length >= 3) {
      opts = opts.filter(o => o.id !== 1);
    }

    // 분기 문항이 아니면(채점 문항) 보기 순서 무작위 섞기
    if (!questionObj.isBranching) {
      const shuffled = [...opts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return opts;
  };

  const gradableQuestionsCount = sessionAnswers.채점기록.length;

  const handleStart = () => {
    setStarted(true);
    setCurrentQuestionObj(quizData[0]); 
    
    const initialAnswers = {
      lastChoice: null,
      hallwayChoice: null,
      loopFinished: false,
      classType: null,
      채점기록: [],
      completedStep1Choices: []
    };
    setSessionAnswers(initialAnswers);
    setDisplayOptions(generateOptions(quizData[0], initialAnswers));
    
    setScore(0);
    setFinished(false);
    setShowFeedback(false);
    setSaveMessage(""); 
  };

  const handleOptionClick = (option) => {
    if (showFeedback) return; 
    setSelectedOption(option);
    setShowFeedback(true);
    
    const updatedAnswers = { ...sessionAnswers };

    // 분기점 상태 업데이트
    if (currentQuestionObj.id === "step1") {
      updatedAnswers.lastChoice = option.id;
      if (!updatedAnswers.completedStep1Choices.includes(option.id)) {
        updatedAnswers.completedStep1Choices.push(option.id);
      }
    } else if (currentQuestionObj.id === "hallway") {
      updatedAnswers.hallwayChoice = option.id;
    } else if (currentQuestionObj.id === "checkLoop") {
      if (option.id === 2) updatedAnswers.loopFinished = true; // 루프 탈출
    } else if (currentQuestionObj.id === "checkTimetable") {
      updatedAnswers.classType = option.id;
    }

    // 채점 문항 기록
    if (!currentQuestionObj.isBranching) {
        if (option.isCorrect) setScore(prev => prev + 1);
        updatedAnswers.채점기록.push(option.isCorrect ? 'O' : 'X');
    }

    setSessionAnswers(updatedAnswers);
  };

  const handleNextQuestion = () => {
    // 1. 루프 마름모꼴에서 '아니요(1번)'를 누른 경우 강제로 step1로 이동
    if (currentQuestionObj.id === "checkLoop" && selectedOption.id === 1) {
      const step1 = quizData.find(q => q.id === "step1");
      setCurrentQuestionObj(step1);
      setDisplayOptions(generateOptions(step1, sessionAnswers));
      setShowFeedback(false);
      setSelectedOption(null);
      return;
    }

    // 2. 조건에 맞는 다음 문제 찾기
    const currentIndex = quizData.findIndex(q => q.id === currentQuestionObj.id);
    let nextIdx = currentIndex + 1;
    
    while (nextIdx < quizData.length) {
      const nextQ = quizData[nextIdx];
      if (!nextQ.condition || nextQ.condition(sessionAnswers)) {
        break; 
      }
      nextIdx++;
    }

    if (nextIdx < quizData.length) {
      const nextQ = quizData[nextIdx];
      setCurrentQuestionObj(nextQ);
      setDisplayOptions(generateOptions(nextQ, sessionAnswers));
      setShowFeedback(false);
      setSelectedOption(null);
    } else {
      setFinished(true); 
    }
  };

  const saveResultToSheet = async () => {
    if (!selectedStudent) {
      alert("선택된 학생이 없습니다.");
      return;
    }
    
    setIsSaving(true);
    setSaveMessage("구글 시트에 저장 중입니다...");

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', 
        body: JSON.stringify({
          date: new Date().toLocaleString(),           
          name: `${selectedClass} ${selectedStudent}`, 
          location: "수업준비",                       
          person: "루프포함",                           
          score: score,                                
          q1: sessionAnswers.채점기록[0] || "",                   
          q2: sessionAnswers.채점기록[1] || "",                   
          q3: sessionAnswers.채점기록[2] || "",                   
          q4: sessionAnswers.채점기록[3] || "",                   
          q5: sessionAnswers.채점기록[4] || "",                   
          q6: sessionAnswers.채점기록[5] || ""                    
        })
      });
      
      setSaveMessage("✅ 시트에 결과가 성공적으로 저장되었습니다!");
    } catch (error) {
      console.error("Error:", error);
      setSaveMessage("❌ 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const getOptionStyle = (option) => {
    if (!showFeedback) {
        return 'hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 border-2 border-transparent cursor-pointer';
    }

    if (currentQuestionObj.isBranching) {
        if (selectedOption?.id === option.id) return 'border-4 border-blue-500 shadow-xl';
        return 'opacity-40 border-2 border-gray-100';
    } else {
        if (selectedOption?.id === option.id && option.isCorrect) return 'border-4 border-green-500 shadow-xl';
        if (selectedOption?.id === option.id && !option.isCorrect) return 'border-4 border-red-500 shadow-xl';
        if (selectedOption?.id !== option.id && option.isCorrect) return 'border-4 border-green-300 opacity-60';
        return 'opacity-40 border-2 border-gray-100';
    }
  };

  const isOneOption = displayOptions?.length === 1;
  const isTwoOptions = displayOptions?.length === 2;
  const isThreeOptions = displayOptions?.length === 3;

  if (!started) {
    return (
      <>
        <GlobalStyle />
        <div className="min-h-screen bg-blue-50 flex flex-col p-3 sm:p-4 md:py-8 md:px-4 lg:px-8 w-full overflow-y-scroll overflow-x-hidden box-border">
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full box-border">
            
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 sm:p-4 md:px-6 mb-4 sm:mb-6 flex justify-between items-center w-full box-border">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate flex-1 pr-2">
                🏫 수업 준비 퀴즈 (플로우차트)
              </h1>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <span className="font-medium text-amber-600 text-sm sm:text-base font-bold">
                  준비 단계
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-8 mb-6 border-t-8 border-amber-400 flex-1 flex flex-col items-stretch text-center w-full box-border">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-700 mb-4 sm:mb-6 text-center">수업 준비, 어떻게 할까요?</h2>
              <p className="text-amber-800 font-medium mb-6 sm:mb-8 bg-amber-50 border border-amber-200 p-4 sm:p-5 rounded-xl text-sm sm:text-base md:text-lg text-center">
                쉬는 시간에 할 일을 다 하고 다음 수업을 준비하는 퀴즈입니다.<br />
                상황에 맞는 올바른 행동을 선택해 보세요!
              </p>

              <div className="bg-gray-50 p-5 sm:p-6 md:p-8 rounded-xl mb-4 border border-gray-200 flex flex-col items-stretch w-full box-border">
                <h3 className="font-bold text-gray-700 mb-5 text-center text-lg sm:text-xl">
                  <span>👤</span> 내 이름 선택하기
                </h3>
                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-2 box-border">
                  {Object.keys(classData).map(className => (
                    <button
                      key={className}
                      onClick={() => {
                        setSelectedClass(className);
                        setSelectedStudent(""); 
                      }}
                      className={`flex-1 min-w-[100px] max-w-[140px] py-4 px-2 rounded-xl flex items-center justify-center gap-2 border-2 transition-all duration-200 box-border ${
                        selectedClass === className
                          ? 'border-amber-500 bg-amber-100 text-amber-800 font-bold shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">🏫</span>
                      <span className="text-sm sm:text-base whitespace-nowrap">{className}</span>
                    </button>
                  ))}
                </div>

                {selectedClass && (
                  <div className="animate-fade-in mt-8 w-full box-border">
                    <div className="w-full border-t border-gray-200 mb-5"></div>
                    <h4 className="text-gray-600 font-medium mb-4 text-center text-lg">
                      <span>👉</span> 이제 이름을 클릭하세요!
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 box-border">
                      {classData[selectedClass].map(studentName => (
                        <button
                          key={studentName}
                          onClick={() => setSelectedStudent(studentName)}
                          className={`flex-1 min-w-[90px] max-w-[120px] py-4 sm:py-5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 sm:gap-2 border-2 transition-all duration-200 box-border ${
                            selectedStudent === studentName
                              ? 'border-blue-500 bg-blue-100 text-blue-800 font-bold shadow-md transform scale-105'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-1'
                          }`}
                        >
                          <span className="text-2xl sm:text-4xl">🧑‍🎓</span>
                          <span className="text-sm sm:text-lg whitespace-nowrap">{studentName}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleStart}
              disabled={!selectedStudent}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl transition duration-200 shadow-md text-xl flex items-center justify-center box-border
                ${selectedStudent ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {selectedStudent ? '퀴즈 시작하기' : '이름을 선택해야 시작할 수 있어요'}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (finished) {
    return (
      <>
        <GlobalStyle />
        <div className="min-h-screen bg-blue-50 flex flex-col p-3 sm:p-4 md:py-8 md:px-4 lg:px-8 w-full overflow-y-scroll overflow-x-hidden box-border">
          <div className="w-full max-w-4xl mx-auto flex flex-col h-full box-border">
            
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 sm:p-4 md:px-6 mb-4 sm:mb-6 flex justify-between items-center w-full box-border">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate flex-1 pr-2">
                🏫 수업 준비 퀴즈 결과
              </h1>
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <span className="font-medium text-blue-600 text-sm sm:text-base font-bold">
                  모든 문제 완료!
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-8 mb-6 border-t-8 border-amber-400 flex-1 flex flex-col items-stretch text-center w-full box-border">
              <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 text-center">🏆</div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4 text-center">퀴즈 완료!</h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 text-center">
                총 {gradableQuestionsCount}번의 선택 중 <span className="font-bold text-amber-600 text-2xl sm:text-3xl">{score}</span>문제를 맞혔습니다!
              </p>
              <div className="bg-amber-100 p-4 sm:p-5 rounded-lg mb-8 sm:mb-10 text-amber-800 font-medium text-sm sm:text-base md:text-lg text-center box-border">
                {score === gradableQuestionsCount ? "완벽해요! 바른 행동을 잘 골라 수업 준비를 마쳤습니다!" : 
                 "아쉽지만 다시 한번 도전해서 완벽한 수업 준비를 해보아요!"}
              </div>

              <div className="bg-gray-50 p-5 sm:p-6 md:p-8 rounded-xl border border-gray-200 flex flex-col items-stretch w-full box-border">
                <h3 className="font-bold text-gray-700 mb-4 text-center text-base sm:text-lg md:text-xl">
                  <span>📝</span> 선생님께 결과 제출하기
                </h3>
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full box-border">
                  <div className="flex-1 px-4 py-3 sm:px-5 sm:py-4 bg-white border border-gray-300 rounded-lg text-gray-700 flex flex-col justify-center box-border">
                    <span className="text-xs sm:text-sm text-gray-500 block mb-1 text-center">제출 정보</span>
                    <span className="font-bold text-lg sm:text-xl block text-center">{selectedClass} {selectedStudent}</span>
                  </div>
                  <button 
                    onClick={saveResultToSheet}
                    disabled={isSaving || saveMessage.includes("✅") || !SCRIPT_URL.includes("http")}
                    className="w-full md:w-auto md:min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 rounded-lg transition text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center items-center box-border"
                  >
                    {isSaving ? "저장 중..." : "결과 전송하기"}
                  </button>
                </div>
                {saveMessage && (
                  <p className={`mt-4 text-base font-bold text-center w-full ${saveMessage.includes("❌") ? 'text-red-500' : 'text-green-600'}`}>
                    {saveMessage}
                  </p>
                )}
                {!SCRIPT_URL.includes("http") && (
                  <p className="mt-3 text-sm text-red-500 font-bold text-center w-full">
                    ※ 선생님이 구글 시트 링크를 연결해야 제출이 가능해요!
                  </p>
                )}
              </div>
            </div>

            <button 
              onClick={handleStart}
              disabled={!saveMessage.includes("✅") && SCRIPT_URL.includes("http")}
              className={`w-full text-white font-bold py-4 px-6 rounded-2xl transition duration-200 shadow-md text-xl flex justify-center items-center box-border
                ${(!saveMessage.includes("✅") && SCRIPT_URL.includes("http")) 
                  ? 'bg-gray-400 cursor-not-allowed opacity-80' 
                  : 'bg-amber-500 hover:bg-amber-600'}`}
            >
              {(!saveMessage.includes("✅") && SCRIPT_URL.includes("http")) ? '결과를 전송해야 다시 풀 수 있어요 🔒' : '다시 풀어보기'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <div className="min-h-screen bg-blue-50 flex flex-col p-3 sm:p-4 md:py-8 md:px-4 lg:px-8 w-full overflow-y-scroll overflow-x-hidden box-border">
        <div className="w-full max-w-4xl mx-auto flex flex-col h-full box-border">
          
          <div className="bg-white rounded-2xl shadow-sm px-4 py-3 sm:p-4 md:px-6 mb-4 sm:mb-6 flex justify-between items-center w-full box-border">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate flex-1 pr-2">
              🏫 수업 준비 퀴즈{currentQuestionObj.category ? ` ${currentQuestionObj.category}` : ''}
            </h1>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <span className="font-medium text-gray-500 text-sm sm:text-base">
                진행 중
              </span>
              <div className="w-20 sm:w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `70%` }} 
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-8 mb-6 border-l-8 border-amber-400 w-full flex flex-col items-stretch box-border">
            <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 leading-tight">
              {currentQuestionObj.question}
            </h2>
            {currentQuestionObj.hint && (
              <div className="bg-amber-50 border-l-4 border-amber-300 p-3 sm:p-4 rounded-r text-amber-900 text-xs sm:text-sm flex gap-2 w-full box-border">
                <span className="font-bold whitespace-nowrap">💡 힌트:</span>
                <span>{currentQuestionObj.hint}</span>
              </div>
            )}
          </div>

          <div className={`w-full grid gap-3 sm:gap-6 mb-6 sm:mb-8 box-border 
            ${isOneOption ? 'grid-cols-1 max-w-sm mx-auto' : 
              isTwoOptions ? 'grid-cols-1 sm:grid-cols-2' : 
              isThreeOptions ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {displayOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                disabled={showFeedback}
                className={`w-full relative text-left flex flex-col bg-white rounded-2xl overflow-hidden transition-all duration-200 shadow-md box-border ${getOptionStyle(option)} ${
                  isOneOption || isTwoOptions || isThreeOptions ? 'h-[180px] sm:h-[344px] md:h-[400px]' : 'h-[180px] sm:h-[220px] md:h-[280px]'
                }`}
              >
                <div className="w-full flex-1 bg-amber-50 flex items-center justify-center border-b border-gray-100 relative overflow-hidden group box-border">
                   <img 
                      src={option.imageSrc} 
                      alt="상황 그림" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if(e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                   />
                   
                   <div className="hidden absolute inset-0 bg-gray-100 flex-col items-center justify-center p-4 box-border">
                      <span className="text-4xl mb-2">🖼️</span>
                      <span className="text-gray-500 text-center text-sm font-medium px-2">
                         이곳에 이미지가 표시됩니다
                      </span>
                   </div>
                   
                   {showFeedback && currentQuestionObj.isBranching && selectedOption?.id === option.id && (
                     <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-blue-500 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg z-10 animate-bounce">✓</div>
                   )}
                   {showFeedback && !currentQuestionObj.isBranching && option.isCorrect && (
                     <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-500 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg z-10 animate-bounce">O</div>
                   )}
                   {showFeedback && !currentQuestionObj.isBranching && selectedOption?.id === option.id && !option.isCorrect && (
                     <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg z-10">X</div>
                   )}
                </div>
                
                <div className={`shrink-0 overflow-y-auto custom-scrollbar flex items-center w-full box-border ${
                  isOneOption || isTwoOptions || isThreeOptions ? 'p-3 sm:p-5 h-[60px] sm:h-[80px]' : 'p-2 sm:p-4 h-[60px] sm:h-[70px]'
                }`}>
                  <p className={`text-gray-800 font-medium leading-snug sm:leading-relaxed w-full ${
                    isOneOption || isTwoOptions || isThreeOptions ? 'text-sm sm:text-lg' : 'text-xs sm:text-base'
                  }`}>{option.text}</p>
                </div>
              </button>
            ))}
          </div>

          {showFeedback && (
            <div className={`bg-white rounded-2xl shadow-xl animate-fade-in-up border-t-8 p-4 sm:p-5 md:p-6 mb-6 mt-2 w-full flex flex-col items-stretch box-border
              ${currentQuestionObj.isBranching ? 'border-blue-500' : selectedOption.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
              
              <div className="flex items-center gap-3 sm:gap-4 mb-3 w-full box-border">
                {currentQuestionObj.isBranching ? (
                  <div className="text-blue-600 font-bold text-lg sm:text-xl flex items-center gap-2">
                    <span>🎯</span> 선택 완료!
                  </div>
                ) : selectedOption.isCorrect ? (
                  <div className="text-green-600 font-bold text-lg sm:text-xl flex items-center gap-2">
                    <span>🎉</span> 정답입니다!
                  </div>
                ) : (
                  <div className="text-red-600 font-bold text-lg sm:text-xl flex items-center gap-2">
                    <span>😅</span> 아쉽네요, 오답입니다.
                  </div>
                )}
              </div>
              
              <p className="text-gray-800 leading-relaxed bg-gray-50 rounded-xl border border-gray-100 text-sm sm:text-base mb-4 p-3 sm:p-4 w-full box-border">
                <strong className="text-blue-600">해설:</strong> {selectedOption.rationale}
              </p>
              
              <button 
                onClick={handleNextQuestion}
                className="w-full md:w-auto md:px-12 md:self-end bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition duration-200 shadow-md py-3 sm:py-3 text-base flex justify-center items-center box-border"
              >
                다음 단계로 ➔
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
