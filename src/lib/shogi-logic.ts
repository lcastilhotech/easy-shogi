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
    'K': { namePt: 'Rei', nameJp: 'Gyoku', kanji: '玉', isPromoted: false, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    'R': { namePt: 'Torre', nameJp: 'Hisha', kanji: '飛', isPromoted: false, movePattern: [[0, -1], [0, 1], [-1, 0], [1, 0]] },
    'B': { namePt: 'Bispo', nameJp: 'Kakugyo', kanji: '角', isPromoted: false, movePattern: [[-1, -1], [1, -1], [-1, 1], [1, 1]] },
    'G': { namePt: 'General de Ouro', nameJp: 'Kinsho', kanji: '金', isPromoted: false, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    'S': { namePt: 'General de Prata', nameJp: 'Ginsho', kanji: '銀', isPromoted: false, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 1], [1, 1]] },
    'N': { namePt: 'Cavaleiro', nameJp: 'Keima', kanji: '桂', isPromoted: false, movePattern: [[-1, -2], [1, -2]] },
    'L': { namePt: 'Lanceiro', nameJp: 'Kyosha', kanji: '香', isPromoted: false, movePattern: [[0, -1]] },
    'P': { namePt: 'Peão', nameJp: 'Fuhyo', kanji: '歩', isPromoted: false, movePattern: [[0, -1]] },
    '+R': { namePt: 'Dragão Rei', nameJp: 'Ryuo', kanji: '龍', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    '+B': { namePt: 'Cavalo Dragão', nameJp: 'Ryuma', kanji: '馬', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]] },
    '+S': { namePt: 'Prata Promovida', nameJp: 'Narigin', kanji: '全', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    '+N': { namePt: 'Cavaleiro Promovido', nameJp: 'Narikei', kanji: '圭', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    '+L': { namePt: 'Lanceiro Promovido', nameJp: 'Narikyo', kanji: '杏', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
    '+P': { namePt: 'Peão Promovido', nameJp: 'Tokin', kanji: 'と', isPromoted: true, movePattern: [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [0, 1]] },
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
}
