import { useState, useEffect, useRef } from 'react';
import './CursorFollower.css';

function CursorFollower() {
  const mousePosition = useRef({ x: 0, y: 0 });
  const dotPosition = useRef({ x: 0, y: 0 });
  const borderDotPosition = useRef({ x: 0, y: 0 });

  const [renderPos, setRenderPos] = useState({
    dot: { x: 0, y: 0 },
    border: { x: 0, y: 0 }
  });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // check whether the device has a mouse-like pointer
    if (!window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    let animationId;

    const handleMouseMove = (e) => {
      mousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, img, input, textarea, select')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e) => {
      if (e.target.closest('a, button, img, input, textarea, select')) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    const animate = () => {
      const lerp = (start, end, factor) => {
        return start + (end - start) * factor;
      };

      dotPosition.current.x = lerp(
        dotPosition.current.x,
        mousePosition.current.x,
        0.2
      );

      dotPosition.current.y = lerp(
        dotPosition.current.y,
        mousePosition.current.y,
        0.2
      );

      borderDotPosition.current.x = lerp(
        borderDotPosition.current.x,
        mousePosition.current.x,
        0.1
      );

      borderDotPosition.current.y = lerp(
        borderDotPosition.current.y,
        mousePosition.current.y,
        0.1
      );

      setRenderPos({
        dot: {
          x: dotPosition.current.x,
          y: dotPosition.current.y
        },
        border: {
          x: borderDotPosition.current.x,
          y: borderDotPosition.current.y
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);

      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="cursor-follower" aria-hidden="true">
      <div
        className="cursor-dot"
        style={{
          left: `${renderPos.dot.x}px`,
          top: `${renderPos.dot.y}px`
        }}
      />

      <div
        className={`cursor-border ${isHovering ? 'cursor-hover' : ''}`}
        style={{
          left: `${renderPos.border.x}px`,
          top: `${renderPos.border.y}px`
        }}
      />
    </div>
  );
}

export default CursorFollower;