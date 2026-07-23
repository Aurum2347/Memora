
function GraphModal({ onClose }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const draggedNodeRef = useRef(null);
  const hoveredNodeRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 5], [1, 6], [2, 7], [2, 8], [3, 9], [3, 10], [4, 11], [4, 12],
      [5, 13], [6, 14], [7, 15], [8, 16], [9, 17], [10, 18], [11, 19], [12, 20],
      [13, 21], [14, 22], [15, 23], [16, 24], [17, 25], [18, 26], [19, 27], [20, 28]
    ];
    const numNodes = 29;

    const initNodes = () => {
      const nodes = [];
      const cx = width / 2;
      const cy = height / 2;
      nodes.push({ x: cx, y: cy, vx: 0, vy: 0, radius: 6 });
      
      for (let i = 1; i < numNodes; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.min(width, height) * 0.15 + Math.random() * Math.min(width, height) * 0.2;
        nodes.push({
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          radius: 3.5 + Math.random() * 2
        });
      }
      nodesRef.current = nodes;
    };
    initNodes();

    const updatePhysics = () => {
      const nodes = nodesRef.current;
      const REPULSION = 1200;
      const SPRING_K = 0.008;
      const SPRING_LEN = 90;
      const DAMPING = 0.85;

      for (let i = 0; i < numNodes; i++) {
        let fx = 0, fy = 0;
        
        for (let j = 0; j < numNodes; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 15);
          const force = REPULSION / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        }

        edges.forEach(([a, b]) => {
          if (a === i || b === i) {
            const other = a === i ? b : a;
            const dx = nodes[other].x - nodes[i].x;
            const dy = nodes[other].y - nodes[i].y;
            const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const force = (dist - SPRING_LEN) * SPRING_K;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        });

        fx += (width / 2 - nodes[i].x) * 0.002;
        fy += (height / 2 - nodes[i].y) * 0.002;

        if (i !== draggedNodeRef.current) {
          nodes[i].vx = (nodes[i].vx + fx) * DAMPING;
          nodes[i].vy = (nodes[i].vy + fy) * DAMPING;
          nodes[i].x += nodes[i].vx;
          nodes[i].y += nodes[i].vy;
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const activeNode = draggedNodeRef.current !== null ? draggedNodeRef.current : hoveredNodeRef.current;

      const neighbors = new Set();
      if (activeNode !== null) {
        neighbors.add(activeNode);
        edges.forEach(([a, b]) => {
          if (a === activeNode) neighbors.add(b);
          if (b === activeNode) neighbors.add(a);
        });
      }

      edges.forEach(([a, b]) => {
        const isActive = activeNode !== null && neighbors.has(a) && neighbors.has(b);
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isActive ? 1.5 : 1;
        ctx.stroke();
      });

      nodes.forEach((node, i) => {
        const isActive = neighbors.has(i);
        const isDimmed = activeNode !== null && !isActive;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * (isActive ? 1.4 : 1), 0, Math.PI * 2);
        
        if (i === 0) {
          ctx.fillStyle = '#ffffff';
        } else {
          ctx.fillStyle = isDimmed ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.7)';
        }
        
        ctx.fill();

        if (isActive) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fill();
        }
      });
    };

    const animate = () => {
      updatePhysics();
      render();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const findNode = (x, y, maxDist = 20) => {
      let best = null;
      let bestDist = maxDist;
      nodesRef.current.forEach((node, i) => {
        const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      return best;
    };

    const handleMouseDown = (e) => {
      const { x, y } = getMousePos(e);
      const node = findNode(x, y);
      if (node !== null) {
        draggedNodeRef.current = node;
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e) => {
      const { x, y } = getMousePos(e);
      if (draggedNodeRef.current !== null) {
        nodesRef.current[draggedNodeRef.current].x = x;
        nodesRef.current[draggedNodeRef.current].y = y;
        nodesRef.current[draggedNodeRef.current].vx = 0;
        nodesRef.current[draggedNodeRef.current].vy = 0;
      } else {
        const node = findNode(x, y);
        hoveredNodeRef.current = node;
        canvas.style.cursor = node !== null ? 'grab' : 'default';
      }
    };

    const handleMouseUp = () => {
      if (draggedNodeRef.current !== null) {
        draggedNodeRef.current = null;
        canvas.style.cursor = hoveredNodeRef.current !== null ? 'grab' : 'default';
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal graph-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Граф связей</h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div className="graph-canvas-wrap">
          <canvas ref={canvasRef}></canvas>
          
          <div className="graph-placeholder-text">
            <div className="placeholder-content">
              <div className="placeholder-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <circle cx="12" cy="4" r="1.5"/>
                  <circle cx="12" cy="20" r="1.5"/>
                  <circle cx="4" cy="12" r="1.5"/>
                  <circle cx="20" cy="12" r="1.5"/>
                  <circle cx="6" cy="6" r="1.5"/>
                  <circle cx="18" cy="6" r="1.5"/>
                  <circle cx="6" cy="18" r="1.5"/>
                  <circle cx="18" cy="18" r="1.5"/>
                  <line x1="12" y1="7.5" x2="12" y2="10.5"/>
                  <line x1="12" y1="13.5" x2="12" y2="16.5"/>
                  <line x1="7.5" y1="12" x2="10.5" y2="12"/>
                  <line x1="13.5" y1="12" x2="16.5" y2="12"/>
                  <line x1="8.2" y1="8.2" x2="10.2" y2="10.2"/>
                  <line x1="13.8" y1="8.2" x2="11.8" y2="10.2"/>
                  <line x1="8.2" y1="15.8" x2="10.2" y2="13.8"/>
                  <line x1="13.8" y1="15.8" x2="11.8" y2="13.8"/>
                </svg>
              </div>
              <h3>Граф связей</h3>
              <p>Функция будет реализована в следующих версиях.<br/>А пока что — просто подвигайте эти шарики.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}