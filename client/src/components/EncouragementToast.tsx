import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';

interface EncouragementToastProps {
  roundNumber: number;
  show: boolean;
  onHide: () => void;
}

const encouragingMessages = [
  { text: "Great job! You're making excellent progress!", emoji: "🎯" },
  { text: "Keep it up! Your values are becoming clearer!", emoji: "✨" },
  { text: "You're doing amazing! Every choice matters!", emoji: "💪" },
  { text: "Fantastic work! You're getting closer to your core values!", emoji: "🌟" },
  { text: "Excellent progress! Your dedication is paying off!", emoji: "🚀" },
  { text: "Way to go! You're uncovering what truly matters to you!", emoji: "💫" },
  { text: "Keep going! You're building valuable self-awareness!", emoji: "🎉" },
  { text: "Awesome! Each selection brings more clarity!", emoji: "🌈" },
  { text: "You're crushing it! Your values framework is taking shape!", emoji: "💡" },
  { text: "Wonderful! You're discovering your authentic priorities!", emoji: "🌸" },
  { text: "Outstanding! You're halfway to understanding yourself better!", emoji: "🎊" },
  { text: "Impressive focus! Your values are aligning beautifully!", emoji: "🎨" },
  { text: "You're on fire! Keep those thoughtful choices coming!", emoji: "🔥" },
  { text: "Brilliant progress! Your inner compass is getting clearer!", emoji: "🧭" },
  { text: "Amazing dedication! You're building something meaningful!", emoji: "🏗️" }
];

type AnimationType = 'slide' | 'bounce' | 'rotate' | 'scale' | 'confetti' | 'spiral' | 'float';

const animations: Record<AnimationType, any> = {
  slide: {
    initial: { opacity: 0, x: -100, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 100, scale: 0.8 }
  },
  bounce: {
    initial: { opacity: 0, y: -100 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: { opacity: 0, y: 100 }
  },
  rotate: {
    initial: { opacity: 0, rotate: -45, scale: 0.8, y: 20 },
    animate: { opacity: 1, rotate: 0, scale: 1, y: 0 },
    exit: { opacity: 0, rotate: 45, scale: 0.8, y: -20 }
  },
  scale: {
    initial: { opacity: 0, scale: 0 },
    animate: { 
      opacity: 1, 
      scale: [0, 1.2, 1],
      transition: { duration: 0.5 }
    },
    exit: { opacity: 0, scale: 0 }
  },
  confetti: {
    initial: { opacity: 0, scale: 0.5, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.5, y: -50 }
  },
  spiral: {
    initial: { opacity: 0, rotate: -90, scale: 0.3, x: -50 },
    animate: { 
      opacity: 1, 
      rotate: 0, 
      scale: 1, 
      x: 0,
      transition: { duration: 0.8 }
    },
    exit: { opacity: 0, rotate: 90, scale: 0.3, x: 50 }
  },
  float: {
    initial: { opacity: 0, y: 100 },
    animate: { 
      opacity: 1, 
      y: [0, -10, 0],
      transition: { 
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }
    },
    exit: { opacity: 0, y: -100 }
  }
};

const backgroundColors = [
  'from-blue-500 to-purple-600',
  'from-green-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-purple-600',
  'from-yellow-500 to-orange-600'
];

export function EncouragementToast({ roundNumber, show, onHide }: EncouragementToastProps) {
  // Initialize with random values
  const [message, setMessage] = useState(encouragingMessages[0]);
  const [animationType, setAnimationType] = useState<AnimationType>('slide');
  const [bgColor, setBgColor] = useState(backgroundColors[0]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastMessageIndex, setLastMessageIndex] = useState(-1);
  
  // Randomize values when show becomes true
  useEffect(() => {
    if (show) {
      // Pick new random message, ensuring it's different from the last one
      let newMessageIndex;
      do {
        newMessageIndex = Math.floor(Math.random() * encouragingMessages.length);
      } while (newMessageIndex === lastMessageIndex && encouragingMessages.length > 1);
      
      setMessage(encouragingMessages[newMessageIndex]);
      setLastMessageIndex(newMessageIndex);
      
      // Randomize animation type
      const types: AnimationType[] = ['slide', 'bounce', 'rotate', 'scale', 'confetti', 'spiral', 'float'];
      setAnimationType(types[Math.floor(Math.random() * types.length)]);
      
      // Randomize background color
      setBgColor(backgroundColors[Math.floor(Math.random() * backgroundColors.length)]);
    }
  }, [show]); // Remove lastMessageIndex from dependencies to prevent infinite loop

  useEffect(() => {
    if (show) {
      // Show confetti for special rounds
      if (roundNumber % 10 === 0 || animationType === 'confetti') {
        setShowConfetti(true);
        const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
        return () => clearTimeout(confettiTimer);
      }
    }
  }, [show, roundNumber, animationType]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.1}
        />
      )}
      
      <AnimatePresence>
        {show && (
          <motion.div
            {...animations[animationType]}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: animationType === 'float' ? [0, 2, -2, 0] : 0
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`bg-gradient-to-r ${bgColor} text-white px-8 py-6 rounded-2xl shadow-2xl`}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-4xl"
                >
                  {message.emoji}
                </motion.span>
                <div>
                  <p className="text-lg font-bold">{message.text}</p>
                  <p className="text-sm opacity-90 mt-1">Round {roundNumber} completed!</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <motion.div
                className="mt-3 bg-white/20 rounded-full h-2 overflow-hidden"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              >
                <div className="h-full bg-white/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}