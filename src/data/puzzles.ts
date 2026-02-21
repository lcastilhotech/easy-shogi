export interface Puzzle {
    id: string;
    title: string;
    description: string;
    sfen: string;
    solution: string[]; // Sequence of moves: ['fromXfromYtoXtoY', ...] or [piece*toXtoY] for drops
    difficulty: number;
    hint: string;
}

export const INITIAL_PUZZLES: Puzzle[] = [
    {
        id: 'mate-in-1-gold',
        title: 'Mate em 1: Ouro Final',
        description: 'O Rei está encurralado. Use seu General de Ouro para finalizar.',
        sfen: '4k4/9/9/9/9/9/9/9/9 b G 1', // Simplified for testing
        solution: ['G*5b'],
        difficulty: 1,
        hint: 'O Ouro ataca o Rei diretamente de frente.'
    },
    {
        id: 'mate-in-1-silver-clinch',
        title: 'Mate em 1: Prata Decisiva',
        description: 'Encontre o xeque-mate usando o General de Prata.',
        sfen: '4k4/9/9/9/9/9/3+P5/9/9 b S 1',
        solution: ['S*4b'],
        difficulty: 1,
        hint: 'A Prata pode atacar diagonalmente.'
    },
    {
        id: 'mate-in-1-rook-corridor',
        title: 'Mate em 1: Corredor da Torre',
        description: 'A Torre domina a fileira. Finalize o jogo.',
        sfen: '5k3/9/9/9/9/9/9/9/R8 b - 1',
        solution: ['1i1a'],
        difficulty: 2,
        hint: 'As peças de longo alcance são fatais em colunas abertas.'
    }
];
