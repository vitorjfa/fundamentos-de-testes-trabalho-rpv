import { validar } from '../framework-teste'

// 🎓 Cenário 03 — Sistema de Notas Escolares
//
// Regras de Negócio:
// 1. São 4 provas: P1, P2, P3, P4 — notas de 0 a 10

// 2. Pesos: P1 e P2 têm peso 1 | P3 e P4 têm peso 2
// 3. Média ponderada: (P1×1 + P2×1 + P3×2 + P4×2) / 6
// 4. Presença >= 75%: bônus de +0,5 na média
// 5. Entregou todos os trabalhos: bônus de +1,0 na média
// 6. Nota máxima é 10 (bônus não ultrapassa 10)
// 7. Média final >= 7: Aprovado
// 8. Média final >= 5 e < 7: Recuperação
// 9. Média final < 5: Reprovado
// 10. Notas devem estar entre 0 e 10 — caso contrário: inválido

// ==================== INTERFACES ====================

interface INotas {
    p1: number
    p2: number
    p3: number
    p4: number
}

interface IAluno {
    id: number
    nome: string
    notas: INotas
    presenca: number           // 0 a 100 (percentual)
    entregouTrabalhos: boolean
}

interface IResultadoMedia {
    media: number
    bonus: number
    mediaFinal: number
    ehValido: boolean
}

interface IResultadoAprovacao {
    situacao: 'aprovado' | 'recuperacao' | 'reprovado' | ''
    mediaFinal: number
    ehValido: boolean
}

// ==================== DADOS ====================

const alunos: IAluno[] = [
    { id: 1, nome: 'Lucas Oliveira', notas: { p1: 6, p2: 7, p3: 8, p4: 9 }, presenca: 80, entregouTrabalhos: true },
    { id: 2, nome: 'Beatriz Santos', notas: { p1: 5, p2: 4, p3: 6, p4: 5 }, presenca: 90, entregouTrabalhos: false },
    { id: 3, nome: 'Gabriel Lima', notas: { p1: 3, p2: 2, p3: 4, p4: 3 }, presenca: 60, entregouTrabalhos: false },
    { id: 4, nome: 'Sofia Pereira', notas: { p1: 10, p2: 9, p3: 10, p4: 10 }, presenca: 95, entregouTrabalhos: true },
    { id: 5, nome: 'Rafael Costa', notas: { p1: 11, p2: 7, p3: 8, p4: 8 }, presenca: 85, entregouTrabalhos: true },
    { id: 6, nome: 'Mariana Souza', notas: { p1: 5, p2: -1, p3: 6, p4: 7 }, presenca: 70, entregouTrabalhos: true },
]

// ==================== FUNÇÕES A IMPLEMENTAR ====================

function calcularMedia(alunoId: number): IResultadoMedia {
    const BONUS_PRESENCA = 0.5
    const BONUS_TRABALHOS = 1.0
    const MIN_PRESENCA = 75
    const NOTA_MAX = 10
    const NOTA_MIN = 0


    const aluno = alunos.find(a => a.id === alunoId)


    if (!aluno) {
        return { media: 0, bonus: 0, mediaFinal: 0, ehValido: false }
    }


    const { p1, p2, p3, p4 } = aluno.notas
    if ([p1, p2, p3, p4].some(n => n < NOTA_MIN || n > NOTA_MAX)) {
        return { media: 0, bonus: 0, mediaFinal: 0, ehValido: false }
    }

    const media = (p1 * 1 + p2 * 1 + p3 * 2 + p4 * 2) / 6


    let bonus = 0
    if (aluno.presenca >= MIN_PRESENCA) bonus += BONUS_PRESENCA
    if (aluno.entregouTrabalhos) bonus += BONUS_TRABALHOS


    const mediaFinal = Math.min(media + bonus, NOTA_MAX)

    return { media, bonus, mediaFinal, ehValido: true }
}

function verificarAprovacao(alunoId: number): IResultadoAprovacao {

    const resultado = calcularMedia(alunoId)


    if (!resultado.ehValido) {
        return { situacao: '', mediaFinal: 0, ehValido: false }
    }


    const { mediaFinal } = resultado
    let situacao: IResultadoAprovacao['situacao']

    if (mediaFinal >= 7) {
        situacao = 'aprovado'
    } else if (mediaFinal >= 5) {
        situacao = 'recuperacao'
    } else {
        situacao = 'reprovado'
    }

    return { situacao, mediaFinal, ehValido: true }
}

// ==================== TESTES ====================

// Teste 1: Média simples sem bônus (presença < 75%, sem trabalhos)
// Aluno: Gabriel Lima (id: 3) — P1:3, P2:2, P3:4, P4:3 | presença: 60% | trabalhos: não
// Média: (3×1 + 2×1 + 4×2 + 3×2) / 6 = (3 + 2 + 8 + 6) / 6 = 19/6 ≈ 3.17
// Bônus: 0 (presença < 75% e sem trabalhos)
// Média final: 3.17
const teste1 = calcularMedia(3)
validar({ descricao: 'calcularMedia() - Média simples sem bônus', atual: Number(teste1.mediaFinal.toFixed(2)), esperado: 3.17 })

// Teste 2: Média com bônus de presença (+0.5)
// Aluno: Beatriz Santos (id: 2) — P1:5, P2:4, P3:6, P4:5 | presença: 90% | trabalhos: não
// Média: (5×1 + 4×1 + 6×2 + 5×2) / 6 = (5 + 4 + 12 + 10) / 6 = 31/6 ≈ 5.17
// Bônus: +0.5 (presença >= 75%)
// Média final: 5.67
const teste2 = calcularMedia(2)
validar({ descricao: 'calcularMedia() - Média com bônus de presença', atual: Number(teste2.mediaFinal.toFixed(2)), esperado: 5.67 })

// Teste 3: Média com bônus de trabalhos (+1.0)
// Aluno: Lucas Oliveira (id: 1) — P1:6, P2:7, P3:8, P4:9 | presença: 80% | trabalhos: sim
// Média: (6×1 + 7×1 + 8×2 + 9×2) / 6 = (6 + 7 + 16 + 18) / 6 = 47/6 ≈ 7.83
// Bônus: +0.5 (presença) + 1.0 (trabalhos) = +1.5
// Média final: 9.33
const teste3 = calcularMedia(1)
validar({ descricao: 'calcularMedia() - Média com bônus presença + trabalhos', atual: Number(teste3.mediaFinal.toFixed(2)), esperado: 9.33 })

// Teste 4: Média com ambos bônus — teto de 10
// Aluno: Sofia Pereira (id: 4) — P1:10, P2:9, P3:10, P4:10 | presença: 95% | trabalhos: sim
// Média: (10×1 + 9×1 + 10×2 + 10×2) / 6 = (10 + 9 + 20 + 20) / 6 = 59/6 ≈ 9.83
// Bônus: +0.5 + 1.0 = +1.5 → 9.83 + 1.5 = 11.33 → teto 10
// Média final: 10
const teste4 = calcularMedia(4)
validar({ descricao: 'calcularMedia() - Bônus com teto de 10', atual: teste4.mediaFinal, esperado: 10 })

// Teste 5: Aprovação — média >= 7 → "aprovado"
// Aluno: Lucas Oliveira (id: 1) — média final: 9.33 → aprovado
const teste5 = verificarAprovacao(1)
validar({ descricao: 'verificarAprovacao() - Aprovado', atual: teste5.situacao, esperado: 'aprovado' })

// Teste 6: Recuperação — média >= 5 e < 7 → "recuperacao"
// Aluno: Beatriz Santos (id: 2) — média final: 5.67 → recuperação
const teste6 = verificarAprovacao(2)
validar({ descricao: 'verificarAprovacao() - Recuperação', atual: teste6.situacao, esperado: 'recuperacao' })

// Teste 7: Reprovação — média < 5 → "reprovado"
// Aluno: Gabriel Lima (id: 3) — média final: 3.17 → reprovado
const teste7 = verificarAprovacao(3)
validar({ descricao: 'verificarAprovacao() - Reprovado', atual: teste7.situacao, esperado: 'reprovado' })

// Teste 8: Nota inválida (P1 = 11) — inválido
// Aluno: Rafael Costa (id: 5) — P1: 11 (> 10)
const teste8 = calcularMedia(5)
validar({ descricao: 'calcularMedia() - Nota acima de 10 inválido', atual: teste8.ehValido, esperado: false })

// Teste 9: Nota negativa (P2 = -1) — inválido
// Aluno: Mariana Souza (id: 6) — P2: -1 (< 0)
const teste9 = calcularMedia(6)
validar({ descricao: 'calcularMedia() - Nota negativa inválido', atual: teste9.ehValido, esperado: false })

// Teste 10: Aluno inexistente — inválido
const teste10 = calcularMedia(99)
validar({ descricao: 'calcularMedia() - Aluno inexistente inválido', atual: teste10.ehValido, esperado: false })
