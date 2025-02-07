# AI Agent Prompt: Gravity Runner Game Architecture

This document outlines an optimized prompt and detailed design specifications for an AI agent tasked with creating a 2D platformer game inspired by the classic Gravity Guy. (Reference: :contentReference[oaicite:0]{index=0})

---

## Overview

The goal is to develop a fast-paced, continuous runner game where the main character is constantly moving to the right and can flip gravity to avoid obstacles and navigate through levels. The game should capture the spirit of Gravity Guy—a title known for its simple controls, gravity inversion mechanics, and visually engaging level design.

---

## Objectives

- **Modular Architecture:** Create a scalable and maintainable game engine with clear separation between core components.
- **Responsive Controls:** Support both touch and keyboard input for gravity flips.
- **Dynamic Levels:** Implement procedural level generation to offer varied gameplay.
- **Physics Integration:** Incorporate a physics system to handle gravity, collision detection, and smooth movement.
- **Visual & Audio Feedback:** Provide engaging graphics (including parallax scrolling) and sound effects that respond to game events.
- **Platform Versatility:** Ensure the design is suitable for mobile devices and desktop environments.

---

## Core Features

1. **Continuous Running:**
   - The character automatically moves to the right at a constant or gradually increasing speed.

2. **Gravity Flipping Mechanic:**
   - A single input (tap or key press) flips the gravity, allowing the character to run on ceilings or floors.
   - Visual feedback should clearly indicate the change in gravity state.

3. **Collision Detection & Physics:**
   - Integrate a physics engine to manage collisions between the character and platforms/obstacles.
   - Simulate realistic movement and falling behavior based on the active gravity.

4. **Procedural Level Generation:**
   - Dynamically create platforms, gaps, and obstacles to maintain gameplay variety and challenge.
   - Adjust difficulty progressively as the player advances.

5. **User Interface & Game States:**
   - Implement distinct states: Main Menu, Playing, Paused, and Game Over.
   - Include HUD elements for score, lives, and current speed.

6. **Audio & Visual Effects:**
   - Incorporate background music and sound effects (e.g., gravity flip, collision).
   - Use parallax scrolling for layered backgrounds to enhance depth.

---

## System Architecture

### 1. Main Game Engine
- **Responsibilities:**
  - Initialize game assets and configurations.
  - Maintain the main game loop, which handles input, updates game state, and renders graphics.
- **Key Considerations:**
  - Optimize the loop for performance across devices.
  - Use a fixed time step or delta time to ensure smooth updates.

### 2. Input Module
- **Responsibilities:**
  - Detect and process touch and keyboard inputs.
  - Map a single input event (e.g., tap or key press) to the gravity-flip action.
- **Key Considerations:**
  - Debounce rapid inputs to prevent unintended behavior.
  - Ensure compatibility with multiple input devices.

### 3. Physics Module
- **Responsibilities:**
  - Simulate gravity and handle collision detection between the character and level elements.
  - Manage character movement and responses when gravity is inverted.
- **Key Considerations:**
  - Choose a lightweight physics engine or implement custom collision logic.
  - Allow for configurable physics parameters (e.g., gravity strength, friction).

### 4. Level Generator
- **Responsibilities:**
  - Procedurally generate level segments, platforms, and obstacles.
  - Adapt the level layout to increase challenge as the game progresses.
- **Key Considerations:**
  - Ensure generated levels are both playable and challenging.
  - Support for both pre-designed checkpoints and random elements.

### 5. Rendering Module
- **Responsibilities:**
  - Draw the character, platforms, backgrounds, and UI components.
  - Implement parallax scrolling for dynamic background layers.
- **Key Considerations:**
  - Optimize drawing routines for performance.
  - Support scaling for various screen sizes and resolutions.

### 6. Audio Manager
- **Responsibilities:**
  - Manage background music and sound effects.
  - Trigger audio events corresponding to game actions (e.g., gravity flip, collisions).
- **Key Considerations:**
  - Provide volume controls and options to mute audio.
  - Preload sounds to minimize latency during gameplay.

### 7. Game State Manager
- **Responsibilities:**
  - Control transitions between different game states (e.g., Menu, Playing, Paused, Game Over).
  - Manage session data such as scores, lives, and achievements.
- **Key Considerations:**
  - Ensure smooth state transitions.
  - Persist player progress and high scores.

---

## Implementation Guidelines

- **Coding Standards:**  
  Write clean, modular, and well-documented code to facilitate future expansion and maintenance.

- **Technology Stack:**  
  The AI agent may choose a suitable game development framework or library (e.g., Phaser for JavaScript, LibGDX for Java, Unity for C#) based on target platforms.

- **Design Patterns:**  
  Consider using patterns such as Entity-Component-System (ECS), Singleton (for core managers), and Observer (for input and event handling).

- **Performance:**  
  Optimize the game loop and rendering pipeline to run efficiently on mobile devices without sacrificing gameplay smoothness.

- **Extensibility:**  
  Architect the system so that new features (e.g., power-ups, multiplayer support, enhanced UI elements) can be added with minimal changes to the core codebase.

---

## AI Agent Prompt

*You are an AI game developer tasked with creating a 2D platformer game inspired by Gravity Guy (a popular 2D platformer from the early iPod touch era). The game must feature continuous running and a unique gravity-flipping mechanic triggered by a single input (touch or key press). Design a modular game architecture with the following components:*

- **Main Game Engine:** Initialize assets and manage the game loop.
- **Input Module:** Process touch and keyboard inputs to trigger gravity flips.
- **Physics Module:** Handle gravity simulation and collision detection.
- **Level Generator:** Procedurally create platforms and obstacles with progressive difficulty.
- **Rendering Module:** Draw game elements with support for parallax backgrounds.
- **Audio Manager:** Manage background music and sound effects.
- **Game State Manager:** Control game states (Menu, Playing, Paused, Game Over) and UI elements.

*Ensure the design is scalable, optimized for performance on mobile devices, and easy to extend with future features like power-ups and multiplayer capabilities. Provide clear pseudocode and documentation of design decisions. Your final output should be a codebase outline or initial prototype that can be incrementally developed into a fully functional game.*

---

## Future Expansion Ideas

- **Power-ups & Collectibles:** Introduce items that temporarily alter physics or grant special abilities.
- **Multiplayer Modes:** Add local or online multiplayer functionality.
- **Advanced Level Design:** Incorporate themed environments, moving platforms, and interactive obstacles.
- **Social Integration:** Implement leaderboards and achievements for competitive play.

---

## Conclusion

This architecture provides a robust foundation for building a Gravity Guy–inspired platformer. It emphasizes modularity, performance, and scalability, ensuring that the game can evolve with additional features and refinements over time.

---

*End of Instructions.*
