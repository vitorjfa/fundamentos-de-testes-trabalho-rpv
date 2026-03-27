import { validar } from '../framework-teste'

// 🏨 Cenário 02 — Sistema de Reserva de Hotel
//
// Regras de Negócio:
// 1. Quarto Standard: R$ 150,00 por noite
// 2. Quarto Luxo: R$ 300,00 por noite
// 3. Café da manhã incluso: acréscimo de R$ 30,00 por noite
// 4. Estadia de 3 ou mais noites: 10% de desconto nas diárias (antes do café)
// 5. Alta temporada (meses 12, 1 e 2): acréscimo de 30% nas diárias (aplicado ANTES do desconto)
// 6. Mínimo: 1 noite | Máximo: 30 noites

// 7. Capacidade: quarto Standard até 2 hóspedes | quarto Luxo até 4 hóspedes

// ==================== INTERFACES ====================

interface IQuarto {
    id: number
    numero: number
    tipo: 'standard' | 'luxo'
    precoNoite: number
    capacidade: number
}

interface IReserva {
    quartoId: number
    noites: number
    mes: number   // 1 a 12
    cafeDaManha: boolean
    hospedes: number
}

interface IResultadoReserva {
    valorDiaria: number
    valorTotal: number
    desconto: number
    ehValida: boolean
}

// ==================== DADOS ====================

const quartos: IQuarto[] = [
    { id: 1, numero: 101, tipo: 'standard', precoNoite: 150, capacidade: 2 },
    { id: 2, numero: 102, tipo: 'standard', precoNoite: 150, capacidade: 2 },
    { id: 3, numero: 201, tipo: 'luxo', precoNoite: 300, capacidade: 4 },
    { id: 4, numero: 202, tipo: 'luxo', precoNoite: 300, capacidade: 4 },
]

// ==================== FUNÇÃO A IMPLEMENTAR ====================

function calcularReserva(reserva: IReserva): IResultadoReserva {
    const CAFE_POR_NOITE = 30
    const DESCONTO_LONGA_ESTADIA = 0.1
    const MIN_NOITES_DESCONTO = 3
    const ACRESCIMO_ALTA_TEMPORADA = 1.30
    const MESES_ALTA_TEMPORADA = [12, 1, 2]
    const MIN_NOITES = 1
    const MAX_NOITES = 30


    const quarto = quartos.find(q => q.id === reserva.quartoId)


    if (
        !quarto ||
        reserva.noites < MIN_NOITES ||
        reserva.noites > MAX_NOITES ||
        reserva.hospedes > quarto.capacidade
    ) {
        return { valorDiaria: 0, valorTotal: 0, desconto: 0, ehValida: false }
    }


    let valorDiaria = quarto.precoNoite


    if (MESES_ALTA_TEMPORADA.includes(reserva.mes)) {
        valorDiaria *= ACRESCIMO_ALTA_TEMPORADA
    }


    const subtotalDiarias = valorDiaria * reserva.noites
    const desconto = reserva.noites >= MIN_NOITES_DESCONTO
        ? parseFloat((subtotalDiarias * DESCONTO_LONGA_ESTADIA).toFixed(2))
        : 0


    const totalCafe = reserva.cafeDaManha ? CAFE_POR_NOITE * reserva.noites : 0


    const valorTotal = parseFloat((subtotalDiarias - desconto + totalCafe).toFixed(2))

    return { valorDiaria, valorTotal, desconto, ehValida: true }
}

// ==================== TESTES ====================

// Teste 1: Reserva standard 1 noite (mês normal, sem café)
// Quarto 101 (standard, R$150), 1 noite, mês 6, sem café, 1 hóspede
// Total: R$150
const teste1 = calcularReserva({
    quartoId: 1, noites: 1, mes: 6, cafeDaManha: false, hospedes: 1
})
validar({ descricao: 'calcularReserva() - Standard 1 noite mês normal', atual: teste1.valorTotal, esperado: 150 })

// Teste 2: Reserva luxo 1 noite (mês normal, sem café)
// Quarto 201 (luxo, R$300), 1 noite, mês 6, sem café, 2 hóspedes
// Total: R$300
const teste2 = calcularReserva({
    quartoId: 3, noites: 1, mes: 6, cafeDaManha: false, hospedes: 2
})
validar({ descricao: 'calcularReserva() - Luxo 1 noite mês normal', atual: teste2.valorTotal, esperado: 300 })

// Teste 3: Reserva com café da manhã (standard, 2 noites)
// Diária: R$150 | Café: R$30/noite
// Total: (150 × 2) + (30 × 2) = 300 + 60 = R$360
const teste3 = calcularReserva({
    quartoId: 1, noites: 2, mes: 6, cafeDaManha: true, hospedes: 2
})
validar({ descricao: 'calcularReserva() - Standard com café 2 noites', atual: teste3.valorTotal, esperado: 360 })

// Teste 4: Desconto 3+ noites (standard, 4 noites, sem café)
// Diária: R$150 | 4 noites: 150 × 4 = R$600
// Desconto 10%: R$60
// Total: 600 - 60 = R$540
const teste4 = calcularReserva({
    quartoId: 1, noites: 4, mes: 6, cafeDaManha: false, hospedes: 1
})
validar({ descricao: 'calcularReserva() - Desconto 3+ noites', atual: teste4.valorTotal, esperado: 540 })

// Teste 5: Alta temporada (mês 1, standard, 1 noite, sem café)
// Diária base: R$150 | Alta temporada: 150 × 1.30 = R$195
// Total: R$195
const teste5 = calcularReserva({
    quartoId: 1, noites: 1, mes: 1, cafeDaManha: false, hospedes: 1
})
validar({ descricao: 'calcularReserva() - Alta temporada mês 1', atual: teste5.valorTotal, esperado: 195 })

// Teste 6: Alta temporada + desconto + café (luxo, 3 noites, mês 12)
// Diária base: R$300 | Alta temporada: 300 × 1.30 = R$390
// 3 noites: 390 × 3 = R$1170 | Desconto 10%: R$117
// Café: 30 × 3 = R$90
// Total: 1170 - 117 + 90 = R$1143
const teste6 = calcularReserva({
    quartoId: 3, noites: 3, mes: 12, cafeDaManha: true, hospedes: 2
})
validar({ descricao: 'calcularReserva() - Alta temporada + desconto + café', atual: teste6.valorTotal, esperado: 1143 })

// Teste 7: 0 noites — inválido
const teste7 = calcularReserva({
    quartoId: 1, noites: 0, mes: 6, cafeDaManha: false, hospedes: 1
})
validar({ descricao: 'calcularReserva() - 0 noites inválido', atual: teste7.ehValida, esperado: false })

// Teste 8: 31 noites — inválido
const teste8 = calcularReserva({
    quartoId: 1, noites: 31, mes: 6, cafeDaManha: false, hospedes: 1
})
validar({ descricao: 'calcularReserva() - 31 noites inválido', atual: teste8.ehValida, esperado: false })

// Teste 9: 3 hóspedes em quarto standard (máx 2) — inválido
const teste9 = calcularReserva({
    quartoId: 1, noites: 2, mes: 6, cafeDaManha: false, hospedes: 3
})
validar({ descricao: 'calcularReserva() - Hóspedes excedem capacidade', atual: teste9.ehValida, esperado: false })

// Teste 10: Luxo 5 noites com café mês normal (cenário completo)
// Diária base: R$300 | 5 noites: 300 × 5 = R$1500
// Desconto 10% (5 >= 3): R$150
// Café: 30 × 5 = R$150
// Total: 1500 - 150 + 150 = R$1500
const teste10 = calcularReserva({
    quartoId: 3, noites: 5, mes: 6, cafeDaManha: true, hospedes: 4
})
validar({ descricao: 'calcularReserva() - Luxo 5 noites com café completo', atual: teste10.valorTotal, esperado: 1500 })
