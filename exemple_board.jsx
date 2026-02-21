import { useState, useCallback } from "react";

// ── Piece definitions ────────────────────────────────────────────────────────
const PIECES = {
    K: { kanji: "王", name: "Rei", promoted: false, color: "normal" },
    R: { kanji: "飛", name: "Torre", promoted: false, color: "normal" },
    "+R": { kanji: "龍", name: "Dragão", promoted: true, color: "promoted" },
    B: { kanji: "角", name: "Bispo", promoted: false, color: "normal" },
    "+B": { kanji: "馬", name: "Cavalo", promoted: true, color: "promoted" },
    G: { kanji: "金", name: "Ouro", promoted: false, color: "normal" },
    S: { kanji: "銀", name: "Prata", promoted: false, color: "normal" },
    "+S": { kanji: "全", name: "P.Prata", promoted: true, color: "promoted" },
    N: { kanji: "桂", name: "Cavalo", promoted: false, color: "normal" },
    "+N": { kanji: "今", name: "P.Cavalo", promoted: true, color: "promoted" },
    L: { kanji: "香", name: "Lança", promoted: false, color: "normal" },
    "+L": { kanji: "仝", name: "P.Lança", promoted: true, color: "promoted" },
    P: { kanji: "歩", name: "Peão", promoted: false, color: "normal" },
    "+P": { kanji: "と", name: "Tokin", promoted: true, color: "promoted" },
};

// ── Initial board setup (classic shogi start) ────────────────────────────────
function createInitialBoard() {
    const board = Array(9).fill(null).map(() => Array(9).fill(null));

    // White (opponent, top, color=1)
    const backRowW = ["L", "N", "S", "G", "K", "G", "S", "N", "L"];
    backRowW.forEach((k, i) => { board[0][i] = { kind: k, color: 1 }; });
    board[1][1] = { kind: "B", color: 1 };
    board[1][7] = { kind: "R", color: 1 };
    for (let i = 0; i < 9; i++) board[2][i] = { kind: "P", color: 1 };

    // Black (player, bottom, color=0)
    const backRowB = ["L", "N", "S", "G", "K", "G", "S", "N", "L"];
    backRowB.forEach((k, i) => { board[8][i] = { kind: k, color: 0 }; });
    board[7][7] = { kind: "B", color: 0 };
    board[7][1] = { kind: "R", color: 0 };
    for (let i = 0; i < 9; i++) board[6][i] = { kind: "P", color: 0 };

    return board;
}

// ── Simple valid move generator (highlight only, not enforcing rules fully) ──
function getValidMoves(board, row, col) {
    const piece = board[row][col];
    if (!piece) return [];
    const moves = [];
    const { kind, color } = piece;
    const dir = color === 0 ? -1 : 1;

    const inBounds = (r, c) => r >= 0 && r < 9 && c >= 0 && c < 9;
    const canCapture = (r, c) => inBounds(r, c) && (!board[r][c] || board[r][c].color !== color);

    const addIfCan = (r, c) => { if (canCapture(r, c)) moves.push([r, c]); };
    const slide = (dr, dc) => {
        let r = row + dr, c = col + dc;
        while (inBounds(r, c)) {
            moves.push([r, c]);
            if (board[r][c]) break;
            r += dr; c += dc;
        }
    };

    const baseKind = kind.startsWith("+") ? kind.slice(1) : kind;
    const isPromoted = kind.startsWith("+");

    if (isPromoted && baseKind !== "R" && baseKind !== "B") {
        // Promoted to Gold movement
        [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1]].forEach(([dr, dc]) => addIfCan(row + dir * dr, col + dc));
        return moves;
    }

    switch (kind) {
        case "K": [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => addIfCan(row + dr, col + dc)); break;
        case "R": case "+R": [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dr, dc]) => slide(dr, dc)); if (isPromoted) [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => addIfCan(row + dr, col + dc)); break;
        case "B": case "+B": [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => slide(dr, dc)); if (isPromoted) [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addIfCan(row + dr, col + dc)); break;
        case "G": [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => addIfCan(row + dr, col + dc)); addIfCan(row + dir, col - 1); addIfCan(row + dir, col + 1); break;
        case "S": [[dir, -1], [dir, 0], [dir, 1], [-dir, -1], [-dir, 1]].forEach(([dr, dc]) => addIfCan(row + dr, col + dc)); break;
        case "N": addIfCan(row + 2 * dir, col - 1); addIfCan(row + 2 * dir, col + 1); break;
        case "L": { let r = row + dir; while (inBounds(r, col)) { moves.push([r, col]); if (board[r][col]) break; r += dir; } } break;
        case "P": addIfCan(row + dir, col); break;
        default: break;
    }
    return moves;
}

// ── Piece SVG Component ──────────────────────────────────────────────────────
function ShogiPiece({ kind, color, size = "md", selected = false, dimmed = false }) {
    const data = PIECES[kind];
    if (!data) return null;
    const isPromoted = data.color === "promoted";
    const flipped = color === 1;

    const sizes = { sm: { outer: 44, font: 16, sub: 7 }, md: { outer: 56, font: 20, sub: 8 }, lg: { outer: 68, font: 24, sub: 9 } };
    const s = sizes[size];

    return (
        <div
            style={{
                width: s.outer, height: s.outer,
                display: "flex", alignItems: "center", justifyContent: "center",
                transform: flipped ? "rotate(180deg)" : "none",
                transition: "transform 0.15s ease, filter 0.15s ease",
                filter: dimmed ? "opacity(0.35)" : selected ? "drop-shadow(0 0 10px rgba(251,191,36,0.8))" : "drop-shadow(0 1px 3px rgba(0,0,0,0.35))",
                position: "relative",
                cursor: "pointer",
            }}
        >
            <svg viewBox="0 0 100 115" width={s.outer - 6} height={s.outer - 6} style={{ position: "absolute" }}>
                <defs>
                    <linearGradient id={`wood-${color}-${kind}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={selected ? "#FEF3C7" : color === 0 ? "#FDFAF3" : "#F5F0E8"} />
                        <stop offset="100%" stopColor={selected ? "#FDE68A" : color === 0 ? "#EDE5CC" : "#DDD5B8"} />
                    </linearGradient>
                    <linearGradient id={`border-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B6914" />
                        <stop offset="100%" stopColor="#5C4207" />
                    </linearGradient>
                    <filter id="inner-shadow">
                        <feOffset dx="0" dy="1" />
                        <feGaussianBlur stdDeviation="1" />
                        <feComposite operator="out" in2="SourceGraphic" />
                    </filter>
                </defs>
                {/* Outer border */}
                <path d="M50 4 L93 28 L88 108 L12 108 L7 28 Z" fill={`url(#border-${color})`} />
                {/* Main face */}
                <path d="M50 7 L90 30 L85 105 L15 105 L10 30 Z" fill={`url(#wood-${color}-${kind})`} />
                {/* Subtle grain line */}
                <path d="M28 50 Q50 45 72 50" stroke="rgba(139,105,20,0.12)" strokeWidth="1" fill="none" />
                <path d="M22 70 Q50 64 78 70" stroke="rgba(139,105,20,0.08)" strokeWidth="1" fill="none" />
                {/* Top notch highlight */}
                <path d="M50 7 L90 30" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" />
                <path d="M50 7 L10 30" stroke="rgba(0,0,0,0.1)" strokeWidth="1" fill="none" />
            </svg>
            {/* Text overlay */}
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                paddingTop: 4, gap: 0,
            }}>
                <span style={{
                    fontSize: s.font, lineHeight: 1,
                    fontFamily: "'Noto Serif JP', 'Yu Mincho', serif",
                    fontWeight: 700,
                    color: isPromoted ? "#9B1C1C" : "#1C1008",
                    letterSpacing: -0.5,
                    textShadow: isPromoted ? "0 0 8px rgba(220,38,38,0.2)" : "none",
                }}>
                    {data.kanji}
                </span>
                <span style={{
                    fontSize: s.sub, lineHeight: 1,
                    fontFamily: "monospace",
                    color: isPromoted ? "rgba(155,28,28,0.5)" : "rgba(28,16,8,0.35)",
                    letterSpacing: 0,
                    marginTop: 1,
                }}>
                    {data.name}
                </span>
            </div>
            {selected && (
                <div style={{
                    position: "absolute", inset: -3,
                    border: "2px solid #F59E0B",
                    borderRadius: 4,
                    boxShadow: "0 0 12px rgba(245,158,11,0.6), inset 0 0 6px rgba(245,158,11,0.2)",
                    pointerEvents: "none",
                    animation: "pulse-ring 1.5s ease-in-out infinite",
                }} />
            )}
        </div>
    );
}

// ── Hand Panel ───────────────────────────────────────────────────────────────
function HandPanel({ hand, color, selectedHand, onSelect, label, validDropSquares }) {
    const entries = Object.entries(hand).filter(([, c]) => c > 0);
    const isActive = color === 0;

    return (
        <div style={{
            background: isActive
                ? "linear-gradient(145deg, #2D1B0E 0%, #3D2512 100%)"
                : "linear-gradient(145deg, #1A1A2E 0%, #16213E 100%)",
            border: `1px solid ${isActive ? "rgba(185,130,70,0.4)" : "rgba(100,120,160,0.3)"}`,
            borderRadius: 12,
            padding: "16px 12px",
            minWidth: 110,
            minHeight: 160,
            boxShadow: isActive
                ? "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                : "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        }}>
            <div style={{
                textAlign: "center", marginBottom: 10,
                fontSize: 10, letterSpacing: 3,
                fontFamily: "monospace", fontWeight: 700,
                color: isActive ? "rgba(251,191,36,0.8)" : "rgba(120,160,210,0.6)",
                textTransform: "uppercase",
            }}>
                {label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {entries.length === 0 && (
                    <div style={{ color: "rgba(255,255,255,0.12)", fontSize: 11, fontFamily: "monospace", textAlign: "center", padding: "8px 0" }}>
                        vazio
                    </div>
                )}
                {entries.map(([kind, count]) => (
                    <div
                        key={kind}
                        onClick={() => isActive && onSelect(kind)}
                        style={{ position: "relative", cursor: isActive ? "pointer" : "not-allowed" }}
                    >
                        <ShogiPiece
                            kind={kind}
                            color={color}
                            size="sm"
                            selected={selectedHand?.kind === kind}
                            dimmed={!isActive}
                        />
                        <div style={{
                            position: "absolute", bottom: -4, right: -4,
                            background: isActive ? "#D97706" : "#4B5563",
                            color: "#fff",
                            fontSize: 9, fontWeight: 800,
                            width: 16, height: 16,
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1.5px solid rgba(255,255,255,0.3)",
                            fontFamily: "monospace",
                        }}>
                            {count}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Turn Indicator ───────────────────────────────────────────────────────────
function TurnBadge({ turn }) {
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            letterSpacing: 2, color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
        }}>
            <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: turn === 0 ? "#F59E0B" : "#60A5FA",
                boxShadow: turn === 0 ? "0 0 8px #F59E0B" : "0 0 8px #60A5FA",
                animation: "glow-pulse 1.5s ease-in-out infinite",
            }} />
            {turn === 0 ? "Sente (Você)" : "Gote (Oponente)"}
        </div>
    );
}

// ── Main Board ───────────────────────────────────────────────────────────────
export default function ShogiBoard() {
    const [board, setBoard] = useState(createInitialBoard);
    const [selected, setSelected] = useState(null);         // [row, col]
    const [selectedHand, setSelectedHand] = useState(null); // { kind, color }
    const [validMoves, setValidMoves] = useState([]);
    const [turn, setTurn] = useState(0);
    const [hands, setHands] = useState({ 0: {}, 1: {} });
    const [lastMove, setLastMove] = useState(null);
    const [captureFlash, setCaptureFlash] = useState(null);

    const isValidMove = useCallback((r, c) => validMoves.some(([vr, vc]) => vr === r && vc === c), [validMoves]);

    const flash = (r, c) => {
        setCaptureFlash([r, c]);
        setTimeout(() => setCaptureFlash(null), 400);
    };

    const addToHand = (color, kind) => {
        const baseKind = kind.startsWith("+") ? kind.slice(1) : kind;
        setHands(prev => ({
            ...prev,
            [color]: { ...prev[color], [baseKind]: (prev[color][baseKind] || 0) + 1 },
        }));
    };

    const removeFromHand = (color, kind) => {
        setHands(prev => ({
            ...prev,
            [color]: { ...prev[color], [kind]: Math.max(0, (prev[color][kind] || 0) - 1) },
        }));
    };

    const handleSquareClick = (row, col) => {
        // Drop from hand
        if (selectedHand && isValidMove(row, col)) {
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = { kind: selectedHand.kind, color: turn };
            removeFromHand(turn, selectedHand.kind);
            setBoard(newBoard);
            setSelectedHand(null);
            setValidMoves([]);
            setLastMove({ from: "hand", to: [row, col] });
            setTurn(t => 1 - t);
            return;
        }

        if (selectedHand) { setSelectedHand(null); setValidMoves([]); return; }

        // Move piece
        if (selected) {
            const [sr, sc] = selected;
            if (isValidMove(row, col)) {
                const newBoard = board.map(r => [...r]);
                const captured = newBoard[row][col];
                if (captured) { flash(row, col); addToHand(turn, captured.kind); }
                newBoard[row][col] = newBoard[sr][sc];
                newBoard[sr][sc] = null;

                // Auto-promote at promotion zone
                const p = newBoard[row][col];
                const inZone = (turn === 0 && row <= 2) || (turn === 1 && row >= 6);
                const promotable = ["R", "B", "S", "N", "L", "P"].includes(p.kind);
                if (inZone && promotable) newBoard[row][col] = { ...p, kind: "+" + p.kind };

                setBoard(newBoard);
                setLastMove({ from: [sr, sc], to: [row, col] });
                setSelected(null);
                setValidMoves([]);
                setTurn(t => 1 - t);
                return;
            }

            // Click same square = deselect
            if (sr === row && sc === col) { setSelected(null); setValidMoves([]); return; }
        }

        // Select a piece
        const piece = board[row][col];
        if (piece && piece.color === turn) {
            setSelected([row, col]);
            setSelectedHand(null);
            setValidMoves(getValidMoves(board, row, col));
        } else {
            setSelected(null);
            setValidMoves([]);
        }
    };

    const handleHandClick = (kind) => {
        if (turn !== 0) return; // Only player can drop
        setSelectedHand({ kind, color: 0 });
        setSelected(null);
        // All empty squares are valid for drop (simplified)
        const drops = [];
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
            if (!board[r][c]) drops.push([r, c]);
        }
        setValidMoves(drops);
    };

    const handleReset = () => {
        setBoard(createInitialBoard());
        setSelected(null); setSelectedHand(null);
        setValidMoves([]); setTurn(0);
        setHands({ 0: {}, 1: {} }); setLastMove(null);
    };

    // Column labels: 9 to 1 (traditional shogi notation)
    const colLabels = ["9", "8", "7", "6", "5", "4", "3", "2", "1"];
    // Row labels: 一 to 九
    const rowLabels = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0F0A05 0%, #1A0F08 50%, #0D0D1A 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: 24, gap: 20,
            fontFamily: "'Noto Serif JP', serif",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&display=swap');
        @keyframes glow-pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes pulse-ring { 0%,100%{box-shadow:0 0 12px rgba(245,158,11,0.6),inset 0 0 6px rgba(245,158,11,0.2)} 50%{box-shadow:0 0 20px rgba(245,158,11,0.9),inset 0 0 10px rgba(245,158,11,0.35)} }
        @keyframes capture-flash { 0%{background:rgba(239,68,68,0.7)} 100%{background:transparent} }
        @keyframes last-move { 0%{background:rgba(251,191,36,0.3)} 100%{background:transparent} }
        * { box-sizing: border-box; }
      `}</style>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ color: "rgba(251,191,36,0.9)", fontSize: 28, letterSpacing: 8, fontWeight: 700, textShadow: "0 0 30px rgba(251,191,36,0.3)" }}>
                    将棋
                </div>
                <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
                <TurnBadge turn={turn} />
                <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.1)" }} />
                <button
                    onClick={handleReset}
                    style={{
                        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.6)", borderRadius: 6, padding: "6px 14px",
                        fontSize: 11, letterSpacing: 2, fontFamily: "monospace", cursor: "pointer",
                        textTransform: "uppercase", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.12)"; e.target.style.color = "#fff"; }}
                    onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.color = "rgba(255,255,255,0.6)"; }}
                >
                    Reiniciar
                </button>
            </div>

            {/* Main layout */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                {/* White hand (opponent) */}
                <HandPanel
                    hand={hands[1]} color={1}
                    selectedHand={null} onSelect={() => { }}
                    label="Gote — Mão"
                    validDropSquares={[]}
                />

                {/* Board + labels */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    {/* Column labels top */}
                    <div style={{ display: "flex", marginLeft: 20, marginBottom: 4 }}>
                        {colLabels.map(l => (
                            <div key={l} style={{
                                width: 62, textAlign: "center",
                                fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.2)",
                                letterSpacing: 1,
                            }}>{l}</div>
                        ))}
                    </div>

                    <div style={{ display: "flex" }}>
                        {/* Row labels left */}
                        <div style={{ display: "flex", flexDirection: "column", marginRight: 4 }}>
                            {rowLabels.map(l => (
                                <div key={l} style={{
                                    height: 62, display: "flex", alignItems: "center", justifyContent: "center",
                                    width: 16, fontSize: 11, fontFamily: "'Noto Serif JP', serif",
                                    color: "rgba(255,255,255,0.2)",
                                }}>{l}</div>
                            ))}
                        </div>

                        {/* The board */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(9, 62px)", gridTemplateRows: "repeat(9, 62px)",
                            border: "2px solid rgba(185,130,70,0.6)",
                            borderRadius: 4,
                            boxShadow: "0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(185,130,70,0.1), inset 0 0 0 1px rgba(255,255,255,0.05)",
                            overflow: "hidden",
                            background: "#B8960C",
                            gap: "1px",
                        }}>
                            {Array.from({ length: 9 }).map((_, row) =>
                                Array.from({ length: 9 }).map((_, colIdx) => {
                                    // colIdx 0 → column 9 (left), colIdx 8 → column 1 (right) in shogi notation
                                    const piece = board[row][colIdx];
                                    const isSel = selected?.[0] === row && selected?.[1] === colIdx;
                                    const isVM = isValidMove(row, colIdx);
                                    const isLast = lastMove && (
                                        (Array.isArray(lastMove.from) && lastMove.from[0] === row && lastMove.from[1] === colIdx) ||
                                        (lastMove.to[0] === row && lastMove.to[1] === colIdx)
                                    );
                                    const isCap = captureFlash?.[0] === row && captureFlash?.[1] === colIdx;

                                    // Hoshi (star) dots at traditional positions
                                    const hoshi = (row === 2 || row === 5 || row === 8) && (colIdx === 2 || colIdx === 5 || colIdx === 8);

                                    return (
                                        <div
                                            key={`${row}-${colIdx}`}
                                            onClick={() => handleSquareClick(row, colIdx)}
                                            style={{
                                                width: 62, height: 62,
                                                background: isCap
                                                    ? "rgba(239,68,68,0.6)"
                                                    : isSel
                                                        ? "rgba(251,191,36,0.25)"
                                                        : isVM
                                                            ? "rgba(99,179,237,0.15)"
                                                            : isLast
                                                                ? "rgba(251,191,36,0.12)"
                                                                : "linear-gradient(145deg, #D4A853 0%, #C9973C 50%, #BF8E30 100%)",
                                                transition: "background 0.15s ease",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                position: "relative", cursor: "pointer",
                                                boxShadow: isSel ? "inset 0 0 0 2px rgba(251,191,36,0.8)" : isVM ? "inset 0 0 0 1px rgba(99,179,237,0.4)" : "none",
                                            }}
                                        >
                                            {/* Valid move indicator */}
                                            {isVM && !piece && (
                                                <div style={{
                                                    width: 16, height: 16, borderRadius: "50%",
                                                    background: "rgba(99,179,237,0.5)",
                                                    boxShadow: "0 0 8px rgba(99,179,237,0.6)",
                                                    border: "2px solid rgba(99,179,237,0.8)",
                                                    position: "absolute",
                                                }} />
                                            )}
                                            {isVM && piece && piece.color !== turn && (
                                                <div style={{
                                                    position: "absolute", inset: 0,
                                                    border: "3px solid rgba(239,68,68,0.8)",
                                                    borderRadius: 2,
                                                    boxShadow: "inset 0 0 8px rgba(239,68,68,0.3)",
                                                    pointerEvents: "none",
                                                }} />
                                            )}
                                            {/* Hoshi dot */}
                                            {hoshi && !piece && (
                                                <div style={{
                                                    position: "absolute", width: 6, height: 6, borderRadius: "50%",
                                                    background: "rgba(90,60,10,0.35)",
                                                }} />
                                            )}
                                            {/* Piece */}
                                            {piece && (
                                                <div style={{ position: "relative", zIndex: 1 }}>
                                                    <ShogiPiece
                                                        kind={piece.kind}
                                                        color={piece.color}
                                                        size="md"
                                                        selected={isSel}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* Black hand (player) */}
                <HandPanel
                    hand={hands[0]} color={0}
                    selectedHand={selectedHand} onSelect={handleHandClick}
                    label="Sente — Mão"
                    validDropSquares={validMoves}
                />
            </div>

            {/* Legend */}
            <div style={{
                display: "flex", gap: 20, marginTop: 4,
                fontSize: 10, fontFamily: "monospace", letterSpacing: 1,
                color: "rgba(255,255,255,0.25)", textTransform: "uppercase",
            }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(99,179,237,0.6)", display: "inline-block" }} />
                    Casas válidas
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, background: "rgba(251,191,36,0.4)", display: "inline-block" }} />
                    Peça selecionada
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ width: 10, height: 10, background: "rgba(239,68,68,0.5)", display: "inline-block", border: "1px solid rgba(239,68,68,0.8)" }} />
                    Captura disponível
                </span>
            </div>
        </div>
    );
}