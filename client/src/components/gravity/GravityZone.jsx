import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';

const GravityZone = ({ children, enabled, className = '' }) => {
  const sceneRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const bodiesRef = useRef(new Map());
  const requestRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      // Cleanup if disabled
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world);
        Matter.Engine.clear(engineRef.current);
        if (renderRef.current) {
          Matter.Render.stop(renderRef.current);
          renderRef.current.canvas.remove();
          renderRef.current.canvas = null;
          renderRef.current.context = null;
          renderRef.current.textures = {};
        }
        if (runnerRef.current) {
          Matter.Runner.stop(runnerRef.current);
        }
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
        }
        engineRef.current = null;
        bodiesRef.current.clear();
      }
      return;
    }

    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

    // Create engine
    const engine = Engine.create();
    engineRef.current = engine;

    // Create renderer (hidden, just for mouse interaction reference if needed, or debugging)
    // We won't actually use the renderer to draw, we'll sync DOM elements.
    // But MouseConstraint needs a mouse which needs an element.
    // We can attach it to the container.

    // Dimensions
    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);

    // Boundaries
    const ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
    const leftWall = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
    const rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Add mouse control
    const mouse = Mouse.create(sceneRef.current);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    Composite.add(engine.world, mouseConstraint);

    // Keep the mouse in sync with rendering
    // render.mouse = mouse;

    // Lock container dimensions to prevent collapse when children become absolute
    const originalHeight = sceneRef.current.style.height;
    const originalWidth = sceneRef.current.style.width;
    sceneRef.current.style.height = `${sceneRef.current.clientHeight}px`;
    sceneRef.current.style.width = `${sceneRef.current.clientWidth}px`;

    // Identify children to be physics bodies
    const elements = sceneRef.current.querySelectorAll('[data-physics="true"]');
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Position needs to be relative to the container if the container is relative
      // But getBoundingClientRect is viewport.
      // Let's assume the container is the viewport or we calculate offsets.
      // For simplicity, let's treat the container as the coordinate system.

      const containerRect = sceneRef.current.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        restitution: 0.5, // Bounciness
        friction: 0.1,
        chamfer: { radius: 5 } // Rounded corners for smoother collisions
      });

      // Store reference
      bodiesRef.current.set(el, body);
      Composite.add(engine.world, body);
    });

    // Sync loop
    const update = () => {
      bodiesRef.current.forEach((body, el) => {
        const { x, y } = body.position;
        const angle = body.angle;

        el.style.position = 'absolute';
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = `${el.offsetWidth}px`; // Lock width
        el.style.transform = `translate(${x - el.offsetWidth / 2}px, ${y - el.offsetHeight / 2}px) rotate(${angle}rad)`;
        el.style.zIndex = 10;
      });

      requestRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      // Cleanup
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      Matter.Runner.stop(runner);

      // Reset styles
      bodiesRef.current.forEach((_, el) => {
        el.style.position = '';
        el.style.left = '';
        el.style.top = '';
        el.style.width = '';
        el.style.transform = '';
        el.style.zIndex = '';
      });
      bodiesRef.current.clear();

      // Reset container dimensions
      if (sceneRef.current) {
        sceneRef.current.style.height = originalHeight;
        sceneRef.current.style.width = originalWidth;
      }
    };
  }, [enabled]);

  return (
    <div
      ref={sceneRef}
      className={`relative w-full h-full ${className}`}
      style={{ overflow: 'hidden' }} // Contain the physics world
    >
      {children}
    </div>
  );
};

export default GravityZone;
