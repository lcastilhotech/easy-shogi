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
        id: 'tsume-1',
        title: 'Fundamentos: Ouro de Frente',
        description: 'O General de Ouro é a peça mais letal para o xeque-mate de perto.',
        sfen: '4k4/4g4/9/9/9/9/9/9/9 b G 1',
        solution: ['G*5b'],
        difficulty: 1,
        hint: 'Coloque o Ouro diretamente na frente do Rei.'
    },
    {
        id: 'tsume-2',
        title: 'Triângulo de Prata',
        description: 'A Prata ataca em direções diferentes do Ouro. Use isso a seu favor.',
        sfen: '4k4/5g3/9/9/9/9/9/9/9 b S 1',
        solution: ['S*5b'],
        difficulty: 1,
        hint: 'A Prata pode recuar diagonalmente, mas aqui ela deve avançar.'
    },
    {
        id: 'tsume-3',
        title: 'Pressão da Torre',
        description: 'A Torre pode dar mate à distância ou de perto. Escolha sabiamente.',
        sfen: '4k4/9/4R4/9/9/9/9/9/9 b - 1',
        solution: ['5c5b'],
        difficulty: 2,
        hint: 'Movimente a Torre para a casa diretamente à frente do Rei.'
    },
    {
        id: 'tsume-4',
        title: 'Mate de Corredor',
        description: 'O Rei está preso na última fileira.',
        sfen: '9/4k4/9/9/9/9/9/9/R8 b - 1',
        solution: ['1i1b'],
        difficulty: 2,
        hint: 'A Torre domina toda a fileira horizontal.'
    }
];
