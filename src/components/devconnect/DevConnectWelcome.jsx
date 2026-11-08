import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Code2, MessageCircle, Sparkles, ArrowRight, Zap } from 'lucide-react';
import '../styles/DevConnect.css';

function DevConnectWelcome({ username, onContinue }) {

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      onContinue();
    }, 8500);

    return () => clearTimeout(welcomeTimer);
  }, [onContinue]);

  return (
    <motion.div
      className="devconnect-welcome-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="devconnect-welcome-card"
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -25 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          className="devconnect-icon-wrapper"
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="devconnect-icon">
            <Users size={42} />
          </div>

          <div className="devconnect-icon-glow"></div>

          <motion.span className="devconnect-spark spark-one">✦</motion.span>
          <motion.span className="devconnect-spark spark-two">✧</motion.span>
          <motion.span className="devconnect-spark spark-three">✦</motion.span>
          <motion.span className="devconnect-spark spark-four">✧</motion.span>
        </motion.div>

        <motion.span
          className="devconnect-welcome-label"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          WELCOME TO THE DEVELOPER COMMUNITY
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          Hey, @{username || 'Developer'}!
          <span> 👋</span>
        </motion.h1>

        <motion.h2
          className="devconnect-main-heading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          Code Together.
          <br />
          <span>Connect Beyond Limits.</span>
        </motion.h2>

        <motion.p
          className="devconnect-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          Great ideas grow when developers connect.
          Meet fellow programmers, exchange knowledge,
          solve problems and create something extraordinary.
        </motion.p>

        <motion.div
          className="devconnect-features"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
        >
          <div>
            <Code2 size={20} />
            <span>Share Ideas</span>
          </div>

          <div>
            <MessageCircle size={20} />
            <span>Chat in Real Time</span>
          </div>

          <div>
            <Users size={20} />
            <span>Meet Developers</span>
          </div>
        </motion.div>

        <motion.div
          className="devconnect-tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <Zap size={16} />
          <span>One connection can start something amazing.</span>
        </motion.div>

        <motion.button
          className="devconnect-start-button"
          onClick={onContinue}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.45)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Community
          <ArrowRight size={19} />
        </motion.button>

        <motion.button
          className="devconnect-skip-button"
          onClick={onContinue}
          whileHover={{ opacity: 1 }}
        >
          Skip intro
        </motion.button>

        <motion.div
          className="devconnect-welcome-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          <Sparkles size={13} />
          <span>Powered by DEV@Deakin Community</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default DevConnectWelcome;