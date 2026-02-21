import { Shogi } from 'shogi.js';

export type PieceSymbol = 'K' | 'R' | 'B' | 'G' | 'S' | 'N' | 'L' | 'P' | '+R' | '+B' | '+S' | '+N' | '+L' | '+P';

export interface ShogiPiece {
    symbol: PieceSymbol;
    namePt: string;
    nameJp: string;
    kanji: string;
    isPromoted: boolean;
    movePattern: number[][]; // Relative coordinates [dx, dy]
}

export const PIECE_DATA: Record<string, Omit<ShogiPiece, 'symbol'>> = {
    'OU': { namePt: 'Rei', nameJp: 'Gyoku', kanji: '玉', isPromoted: false, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    'HI': { namePt: 'Torre', nameJp: 'Hisha', kanji: '飛', isPromoted: false, movePattern: [[0, -1], [0, 1], [-1, 0], [1, 0]] },
    'KA': { namePt: 'Bispo', nameJp: 'Kakugyo', kanji: '角', isPromoted: false, movePattern: [[-1, -1], [1, -1], [-1, 1], [1, 1]] },
    'KI': { namePt: 'General de Ouro', nameJp: 'Kinsho', kanji: '金', isPromoted: false, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    'GI': { namePt: 'General de Prata', nameJp: 'Ginsho', kanji: '銀', isPromoted: false, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 1], [1, 1]] },
    'KE': { namePt: 'Cavaleiro', nameJp: 'Keima', kanji: '桂', isPromoted: false, movePattern: [[-1, -2], [1, -2]] },
    'KY': { namePt: 'Lanceiro', nameJp: 'Kyosha', kanji: '香', isPromoted: false, movePattern: [[0, -1]] },
    'FU': { namePt: 'Peão', nameJp: 'Fuhyo', kanji: '歩', isPromoted: false, movePattern: [[0, -1]] },
    'RY': { namePt: 'Dragão Rei', nameJp: 'Ryuo', kanji: '龍', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    'UM': { namePt: 'Cavalo Dragão', nameJp: 'Ryuma', kanji: '馬', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    'NG': { namePt: 'Prata Promovida', nameJp: 'Narigin', kanji: '全', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    'NK': { namePt: 'Cavaleiro Promovido', nameJp: 'Narikei', kanji: '圭', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    'NY': { namePt: 'Lanceiro Promovido', nameJp: 'Narikyo', kanji: '杏', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    'TO': { namePt: 'Peão Promovido', nameJp: 'Tokin', kanji: 'と', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
};

export class ShogiEngine {
    private game: Shogi;

    constructor(sfen?: string) {
        this.game = new Shogi();
        if (sfen) {
            this.game.initializeFromSFENString(sfen);
        }
    }

    getBoard() {
        return this.game.board;
    }

    getPieceAt(x: number, y: number) {
        return this.game.get(x, y);
    }

    move(from: { x: number, y: number }, to: { x: number, y: number }, promote: boolean = false) {
        try {
            this.game.move(from.x, from.y, to.x, to.y, promote);
            return true;
        } catch (e) {
            return false;
        }
    }

    getSFEN() {
        return this.game.toSFENString();
    }

    getHandSummary(color: 0 | 1) {
        return this.game.getHandsSummary(color);
    }

    drop(pieceKind: string, toX: number, toY: number) {
        try {
            // Map our SFEN/simplified symbols to shogi.js Kind strings if they are single letters
            const kindMap: Record<string, string> = {
                'G': 'KI', 'S': 'GI', 'N': 'KE', 'L': 'KY', 'P': 'FU', 'R': 'HI', 'B': 'KA'
            };
            const mappedKind = kindMap[pieceKind] || pieceKind;

            this.game.drop(toX, toY, mappedKind as any);
            return true;
        } catch (e) {
            console.error('Drop error:', e);
            return false;
        }
    }

    getTurn() {
        return this.game.turn;
    }

    getKindString(kind: any): string {
        const kinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI", "OU", "TO", "NY", "NK", "NG", "UM", "RY"];
        return typeof kind === 'number' ? kinds[kind] : kind;
    }

    getValidMoves(x: number, y: number) {
        try {
            return this.game.getMovesFrom(x, y);
        } catch (e) {
            return [];
        }
    }

    getValidDrops(color: 0 | 1) {
        try {
            return this.game.getDropsBy(color);
        } catch (e) {
            return [];
        }
    }
}
