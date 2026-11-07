import { motion } from 'framer-motion';
import { Sparkles, Code2, MessageCircle, ArrowRight } from 'lucide-react';

function AIWelcome({ fullName, onStart }) {
  return (
    <motion.div
      className="ai-welcome-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="ai-welcome-card"
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: -35, filter: 'blur(8px)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className="ai-welcome-icon-wrapper"
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="ai-welcome-icon"
            animate={{
              y: [0, -8, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles size={38} />
          </motion.div>

          <div className="ai-logo-glow"></div>

          <span className="ai-spark spark-one">✦</span>
          <span className="ai-spark spark-two">✧</span>
          <span className="ai-spark spark-three">✦</span>
          <span className="ai-spark spark-four">✧</span>
        </motion.div>

        <span className="ai-welcome-label">
          YOUR PERSONAL LEARNING ASSISTANT
        </span>

        <h1>
          Welcome, {fullName || 'Developer'}!
          <span> 👋</span>
        </h1>

        <p className="ai-welcome-description">
          Meet DEV@Deakin AI, your programming companion.
          Whether you need help understanding concepts, solving
          coding errors or exploring new technologies, I'm here
          to make learning easier.
        </p>

        <div className="ai-welcome-features">
          <div>
            <Code2 size={20} />
            <span>Code Assistance</span>
          </div>

          <div>
            <MessageCircle size={20} />
            <span>Concept Explanations</span>
          </div>

          <div>
            <Sparkles size={20} />
            <span>Programming Help</span>
          </div>
        </div>

        <motion.button
          className="ai-start-button"
          onClick={onStart}
          whileHover={{
            scale: 1.06,
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.55)'
          }}
          whileTap={{ scale: 0.94 }}
        >
          Let's Get Started
          <ArrowRight size={19} />
        </motion.button>

        <span className="ai-welcome-footer">
          Powered by Google Gemini
        </span>
      </motion.div>
    </motion.div>
  );
}

export default AIWelcome;