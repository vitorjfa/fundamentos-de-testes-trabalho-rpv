import { validar } from '../framework-teste'

// 🍽️ Cenário 04 — Calculadora de Gorjeta
// ⚠️  Este cenário está FINALIZADO e serve como EXEMPLO de implementação correta.
//
// Regras de Negócio:
// 1. Qualidade 'ruim'      → gorjeta de  5% sobre o valor da conta

// 2. Qualidade 'regular'   → gorjeta de 10% sobre o valor da conta
// 3. Qualidade 'excelente' → gorjeta de 15% sobre o valor da conta
// 4. O valor da conta deve ser maior que zero — caso contrário o resultado é inválido

interface IEntradaGorjeta {
    valorConta: number
    qualidadeServico: 'ruim' | 'regular' | 'excelente'
}

interface IResultadoGorjeta {
    gorjeta: number
    valorTotal: number
    ehValido: boolean
}

const PERCENTUAIS: Record<IEntradaGorjeta['qualidadeServico'], number> = {
    ruim: 0.05,
    regular: 0.10,
    excelente: 0.15,
}

function calcularGorjeta(entrada: IEntradaGorjeta): IResultadoGorjeta {
    if (entrada.valorConta <= 0) {
        return { gorjeta: 0, valorTotal: 0, ehValido: false }
    }

    const percentual = PERCENTUAIS[entrada.qualidadeServico]
    const gorjeta = Math.round(entrada.valorConta * percentual * 100) / 100
    const valorTotal = Math.round((entrada.valorConta + gorjeta) * 100) / 100

    return { gorjeta, valorTotal, ehValido: true }
}

// ==================== TESTES ====================

console.log('🍽️  Cenário 04 — Calculadora de Gorjeta\n')

// Teste 1: Serviço excelente → 15% de gorjeta
// Conta: R$ 100,00 | Percentual: 15% | Gorjeta: R$ 15,00 | Total: R$ 115,00
const teste1 = calcularGorjeta({ valorConta: 100, qualidadeServico: 'excelente' })
validar({ descricao: 'calcularGorjeta() - Serviço excelente (15%): gorjeta correta', atual: teste1.gorjeta, esperado: 15 })
validar({ descricao: 'calcularGorjeta() - Serviço excelente (15%): valor total correto', atual: teste1.valorTotal, esperado: 115 })

// Teste 2: Serviço regular → 10% de gorjeta
// Conta: R$ 80,00 | Percentual: 10% | Gorjeta: R$ 8,00 | Total: R$ 88,00
const teste2 = calcularGorjeta({ valorConta: 80, qualidadeServico: 'regular' })
validar({ descricao: 'calcularGorjeta() - Serviço regular (10%): gorjeta correta', atual: teste2.gorjeta, esperado: 8 })

// Teste 3: Conta com valor zero → resultado inválido
const teste3 = calcularGorjeta({ valorConta: 0, qualidadeServico: 'excelente' })
validar({ descricao: 'calcularGorjeta() - Conta R$ 0,00: ehValido deve ser false', atual: teste3.ehValido, esperado: false })
