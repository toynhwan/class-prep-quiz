import React, { useState, useEffect } from 'react';

export default function ClassPrepQuiz() {
  const [studentName, setStudentName] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [currentNode, setCurrentNode] = useState("q_start");
  const [score, setScore] = useState(0);
  const [visitedTasks, setVisitedTasks] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // 📝 학생의 문항별(O/X/안함) 결과를 추적하는 상태
  const [results, setResults] = useState({
    q_water: '안함',
    q_toilet: '안함',
    q_hallway_friend: '안함',
    q_hallway_alone: '안함',
    q_class_prep: '안함',
    q_subject_prep: '안함'
  });

  // 👇 선생님의 구글 시트 앱스 스크립트 배포 URL로 꼭 변경해주세요!
  const SCRIPT_URL = "선생님의_구글스크립트_URL을_여기에_넣어주세요";

  // 퀴즈 데이터
  const quizData = {
    intro: {
      text: "쉬는 시간이 되었어요. 우리는 무엇을 해야 할까요?",
      imageSrc: "", 
    },
    q_start: {
      text: "쉬는 시간이 되었습니다. 무엇을 할까요?",
      isBranching: true,
      options: [
        { id: "toilet", text: "화장실 다녀오기", nextId: "q_toilet" },
        { id: "water", text: "물 마시기", nextId: "q_water" },
        { id: "hallway", text: "복도에서 휴식하기", nextId: "q_hallway_branch" }
      ]
    },
    q_toilet: {
      text: "화장실에서 대소변을 본 후, 꼭 해야 할 바른 행동은 무엇일까요?",
      options: [
        { text: "비누를 묻혀 흐르는 물에 손을 깨끗하게 씻는다.", isCorrect: true, textFeedback: "참 잘했어요! 청결은 기본이죠." },
        { text: "귀찮으니까 손을 씻지 않고 그냥 교실로 빨리 뛰어간다.", isCorrect: false, textFeedback: "손에 세균이 많아요. 꼭 씻어야 해요!" },
        { text: "물만 살짝 묻히고 수건이나 옷에 쓱쓱 닦아버린다.", isCorrect: false, textFeedback: "비누를 사용해야 세균이 없어져요." },
        { text: "친구에게 물을 튀기며 장난을 치다 교실로 돌아간다.", isCorrect: false, textFeedback: "화장실에서 장난치면 미끄러져 다칠 수 있어요." }
      ],
      nextId: "q_start"
    },
    q_water: {
      text: "물을 마실 때 가장 바른 행동은 무엇일까요?",
      options: [
        { text: "개인 텀블러나 컵을 이용하여 물을 흘리지 않게 차분히 마신다.", isCorrect: true, textFeedback: "맞아요! 텀블러 사용은 환경도 보호해요." },
        { text: "정수기 나오는 곳에 입을 대고 바로 마신다.", isCorrect: false, textFeedback: "위생에 아주 좋지 않은 행동이에요." },
        { text: "정수기 앞에서 친구와 물을 뿌리며 물장난을 친다.", isCorrect: false, textFeedback: "주변이 물바다가 되면 친구들이 미끄러져 다쳐요." },
        { text: "바닥에 물을 흘려도 닦지 않고 그냥 돌아간다.", isCorrect: false, textFeedback: "흘린 물은 휴지로 닦아야 안전해요." }
      ],
      nextId: "q_start"
    },
    q_hallway_branch: {
      text: "복도에서 어떻게 휴식할 건가요?",
      isBranching: true,
      options: [
        { text: "친구 만나기 (대화하기)", nextId: "q_hallway_friend" },
        { text: "혼자 쉬기", nextId: "q_hallway_alone" }
      ]
    },
    q_hallway_friend: {
      text: "복도에서 친구를 만나 대화할 때 알맞은 행동은 무엇일까요?",
      options: [
        { text: "다른 반에 방해가 되지 않도록 조용하고 다정한 목소리로 대화한다.", isCorrect: true, textFeedback: "배려심 넘치는 모습 최고예요!" },
        { text: "복도 끝에서 끝까지 들리도록 아주 큰 소리로 떠든다.", isCorrect: false, textFeedback: "수업 중인 다른 반에 큰 방해가 됩니다." },
        { text: "복도에서 술래잡기를 하며 쿵쿵 뛰어다닌다.", isCorrect: false, textFeedback: "복도에서 뛰면 크게 다칠 수 있어요." },
        { text: "친구와 심한 욕설이나 거친 장난을 하며 논다.", isCorrect: false, textFeedback: "바르고 고운 말을 써야 좋은 친구관계를 맺을 수 있어요." }
      ],
      nextId: "q_start"
    },
    q_hallway_alone: {
      text: "복도에서 혼자 쉴 때 알맞은 행동은 무엇일까요?",
      options: [
        { text: "창밖을 보거나 한쪽 벽에 기대어 통행에 방해되지 않게 차분히 쉰다.", isCorrect: true, textFeedback: "조용히 휴식하는 방법을 잘 알고 있네요." },
        { text: "복도 한가운데에 대자로 길게 드러누워 잠을 잔다.", isCorrect: false, textFeedback: "통행에 방해가 되고 다칠 수 있어요." },
        { text: "지나가는 다른 반 친구들에게 시비를 걸거나 장난을 친다.", isCorrect: false, textFeedback: "다른 사람을 불편하게 하면 안 돼요." },
        { text: "교실 문을 쾅쾅 열고 닫으며 돌아다닌다.", isCorrect: false, textFeedback: "소음은 다른 친구들의 휴식과 수업을 방해해요." }
      ],
      nextId: "q_start"
    },
    q_schedule: {
      text: "교실로 돌아왔습니다. 다음 시간은 어떤 수업인가요?",
      isBranching: true,
      options: [
        { text: "교실 수업 (우리 반 교실)", nextId: "q_class_prep" },
        { text: "교과교실 수업 (과학실, 음악실 등 이동)", nextId: "q_subject_prep" }
      ]
    },
    q_class_prep: {
      text: "다음 시간이 '교실 수업'입니다. 알맞은 준비 행동은 무엇일까요?",
      options: [
        { text: "해당 교과목을 확인하고, 책상 위에 교과서와 필기도구를 꺼내 둔다.", isCorrect: true, textFeedback: "완벽한 수업 준비입니다!" },
        { text: "수업과 상관없는 장난감이나 만화책을 책상 위에 그대로 둔다.", isCorrect: false, textFeedback: "책상 위에는 수업에 필요한 물건만 두세요." },
        { text: "책상 위를 텅 비워두고 엎드려 계속 잠을 잔다.", isCorrect: false, textFeedback: "선생님이 오시기 전에 미리 수업 준비를 해야 해요." },
        { text: "다른 친구의 교과서를 허락 없이 가져와 내 책상에 둔다.", isCorrect: false, textFeedback: "친구 물건을 허락 없이 만지면 안 돼요." }
      ],
      nextId: "end"
    },
    q_subject_prep: {
      text: "다음 시간이 과학실, 음악실 같은 '교과교실 수업'입니다. 알맞은 행동은 무엇일까요?",
      options: [
        { text: "이동할 교실을 확인하고, 수업 준비물을 챙겨서 조용히 이동한다.", isCorrect: true, textFeedback: "이동 수업 준비의 정석입니다!" },
        { text: "어디로 가는지도 모른 채 준비물 없이 무작정 앞 친구만 따라간다.", isCorrect: false, textFeedback: "스스로 시간표와 준비물을 확인해야 해요." },
        { text: "가기 싫다며 우리 반 교실에 혼자 남아 있는다.", isCorrect: false, textFeedback: "정해진 수업 장소로 꼭 이동해야 합니다." },
        { text: "이동하면서 친구와 큰 소리로 장난을 치며 다른 반을 방해한다.", isCorrect: false, textFeedback: "이동할 때는 사뿐사뿐 조용히 걸어야 해요." }
      ],
      nextId: "end"
    }
  };

  useEffect(() => {
    if (isStarted && !showIntro && !quizFinished && currentNode) {
      const q = quizData[currentNode];
      if (q && !q.isBranching) {
        const shuffled = [...q.options].sort(() => Math.random() - 0.5);
        setShuffledOptions(shuffled);
      } else {
        setShuffledOptions([]);
      }
    }
  }, [currentNode, isStarted, showIntro, quizFinished]);

  const handleStart = () => {
    if (!studentName.trim()) {
      alert("이름을 입력해주세요!");
      return;
    }
    setIsStarted(true);
    setShowIntro(true);
    setCurrentNode("q_start");
    setScore(0);
    setVisitedTasks([]);
    setQuizFinished(false);
    setSaveMessage("");
    setFeedback(null);
    // 새 게임 시작 시 결과 초기화 (전부 '안함'으로 설정)
    setResults({
      q_water: '안함',
      q_toilet: '안함',
      q_hallway_friend: '안함',
      q_hallway_alone: '안함',
      q_class_prep: '안함',
      q_subject_prep: '안함'
    });
  };

  const handleOptionClick = (option) => {
    const q = quizData[currentNode];
    
    // 분기점 문항 (채점 안 함)
    if (q.isBranching) {
      if (currentNode === "q_start" && option.id) {
        setVisitedTasks([...visitedTasks, option.id]);
      }
      setCurrentNode(option.nextId);
      return;
    }

    // 채점 문항 (정답/오답 판별 및 기록)
    if (option.isCorrect) {
      setScore(s => s + 10);
      setResults(prev => ({ ...prev, [currentNode]: 'O' }));
      setFeedback({ isCorrect: true, text: option.textFeedback, nextId: option.nextId });
    } else {
      setResults(prev => ({ ...prev, [currentNode]: 'X' }));
      setFeedback({ isCorrect: false, text: option.textFeedback, nextId: option.nextId });
    }
  };

  const handleNextAfterFeedback = () => {
    if (feedback.nextId === "end") {
      setQuizFinished(true);
    } else {
      setCurrentNode(feedback.nextId);
    }
    setFeedback(null);
  };

  const submitResults = async () => {
    if (!SCRIPT_URL.includes("http")) {
      setSaveMessage("선생님이 구글 시트 링크를 아직 연결하지 않았습니다.");
      return;
    }
    setSaveMessage("전송 중... ⏳");
    
    try {
      // JSON 객체로 데이터 포장하기 (한글 깨짐 및 누락 방지)
      const payload = {
        name: studentName,
        water: results.q_water,
        toilet: results.q_toilet,
        hallway_friend: results.q_hallway_friend,
        hallway_alone: results.q_hallway_alone,
        class_prep: results.q_class_prep,
        subject_prep: results.q_subject_prep
      };

      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" }, // CORS 에러 방지를 위해 text/plain 사용
        body: JSON.stringify(payload)
      });
      
      setSaveMessage("✅ 시트에 결과가 성공적으로 저장되었습니다!");
    } catch (err) {
      setSaveMessage("❌ 전송 실패. 선생님께 말씀드려주세요.");
    }
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-3xl font-black text-blue-800 mb-6 tracking-tight">🏫 쉬는 시간 수업 준비 퀴즈</h1>
          <p className="text-gray-600 mb-6 font-medium">나의 이름을 적고 시작해볼까요?</p>
          <input 
            type="text" 
            placeholder="이름 입력 (예: 홍길동)"
            className="w-full px-5 py-4 border-2 border-blue-200 rounded-xl mb-6 text-center text-lg focus:outline-none focus:border-blue-500 font-bold"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleStart()}
          />
          <button 
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-lg text-lg"
          >
            퀴즈 시작하기 🚀
          </button>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg w-full flex flex-col">
          <div className="p-8 text-center bg-amber-100 flex-grow flex flex-col justify-center items-center">
            <div className="text-6xl mb-6">🔔</div>
            <h2 className="text-2xl font-black text-amber-900 mb-4">{quizData.intro.text}</h2>
            {quizData.intro.imageSrc ? (
              <img src={quizData.intro.imageSrc} alt="상황 그림" className="rounded-xl shadow-md w-full max-h-64 object-cover mb-4" />
            ) : (
              <div className="w-full h-48 bg-white/50 rounded-xl flex items-center justify-center text-amber-300 text-5xl shadow-inner mb-4">🖼️</div>
            )}
            <p className="text-amber-800 font-medium">자, 이제 어떤 활동을 할지 스스로 선택해 봅시다!</p>
          </div>
          <div className="p-4 bg-white">
            <button 
              onClick={() => setShowIntro(false)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-md text-lg transition"
            >
              활동 고르러 가기 ➔
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-green-800 mb-2">수고했어요, {studentName}님!</h2>
          <p className="text-gray-600 font-medium mb-6">수업 준비를 훌륭하게 마쳤습니다.</p>
          
          <div className="bg-green-100 p-6 rounded-2xl mb-6">
            <p className="text-sm text-green-700 font-bold mb-1">나의 획득 점수</p>
            <p className="text-5xl font-black text-green-600">{score}점</p>
          </div>

          <div className="space-y-3 mb-6">
            <button 
              onClick={submitResults}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition shadow-md text-lg flex items-center justify-center"
            >
              📊 선생님께 결과 전송하기
            </button>
            {saveMessage && (
              <p className={`font-bold ${saveMessage.includes("✅") ? "text-green-600" : "text-red-500"}`}>
                {saveMessage}
              </p>
            )}
          </div>

          <button 
            onClick={handleStart}
            disabled={!saveMessage.includes("✅") && SCRIPT_URL.includes("http")}
            className={`w-full font-bold py-4 px-6 rounded-xl transition text-lg shadow-sm
              ${(!saveMessage.includes("✅") && SCRIPT_URL.includes("http")) 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'}`}
          >
            {(!saveMessage.includes("✅") && SCRIPT_URL.includes("http")) ? '전송 완료 후 다시 풀기 🔒' : '처음부터 다시 풀기 🔄'}
          </button>
        </div>
      </div>
    );
  }

  const q = quizData[currentNode];
  
  let displayOptions = q.options;
  if (currentNode === "q_start") {
    displayOptions = q.options.filter(opt => !visitedTasks.includes(opt.id));
    displayOptions.push({ 
      text: "🚶 교실로 돌아가기 (다음 시간표 확인)", 
      nextId: "q_schedule" 
    });
  } else if (!q.isBranching && shuffledOptions.length > 0) {
    displayOptions = shuffledOptions;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-lg w-full flex flex-col h-[90vh]">
        
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center shrink-0 shadow-md z-10">
          <div className="font-bold text-lg bg-blue-700 px-3 py-1 rounded-lg">👤 {studentName}</div>
          <div className="font-black text-xl text-yellow-300 drop-shadow-md">⭐ {score}점</div>
        </div>

        <div className="p-8 text-center flex-grow flex flex-col justify-center overflow-y-auto">
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-snug break-keep">
            {q.text}
          </h2>
        </div>

        {feedback && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-20 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
              <div className="text-7xl mb-4">
                {feedback.isCorrect ? "⭕" : "❌"}
              </div>
              <h3 className={`text-2xl font-black mb-3 ${feedback.isCorrect ? "text-green-600" : "text-red-500"}`}>
                {feedback.isCorrect ? "정답입니다!" : "아쉬워요!"}
              </h3>
              <p className="text-gray-700 font-medium text-lg mb-8 leading-relaxed break-keep">
                {feedback.text}
              </p>
              <button 
                onClick={handleNextAfterFeedback}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg text-lg transition"
              >
                다음 단계로 ➔
              </button>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-100 shrink-0">
          <div className="flex flex-col gap-3">
            {displayOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                className={`w-full text-left font-bold py-4 px-6 rounded-2xl transition duration-200 shadow-sm text-lg md:text-xl border-2 hover:-translate-y-1 hover:shadow-md break-keep flex items-center
                  ${q.isBranching 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 hover:bg-indigo-100 hover:border-indigo-300' 
                    : 'bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                <span className="mr-3 text-2xl opacity-60">
                  {q.isBranching ? '👉' : ['A', 'B', 'C', 'D'][idx]}
                </span>
                <span>{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
