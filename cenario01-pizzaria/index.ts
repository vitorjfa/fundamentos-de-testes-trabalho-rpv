import { validar } from '../framework-teste'

// 🍕 Cenário 01 — Pizzaria Delivery
//
// Regras de Negócio:
// 1. Tamanhos e preços: P = R$25, M = R$35, G = R$50, GG = R$65

// 2. Borda recheada: acréscimo de R$ 8,00 por pizza

// 3. Taxa de entrega: R$ 7,00 fixo — grátis se o subtotal for acima de R$ 80,00
// 4. Promoção: 2+ pizzas de tamanho G ou GG → 10% de desconto no subtotal

// 5. Pedido mínimo: R$ 20,00 (subtotal, antes da taxa de entrega)

// 6. Máximo de 5 pizzas por pedido (soma das quantidades)

// ==================== INTERFACES ====================

interface IPizza {
    id: number
    nome: string
    tamanho: 'P' | 'M' | 'G' | 'GG'
    preco: number
}

interface IItemPedido {
    pizzaId: number
    quantidade: number
    bordaRecheada: boolean
}

interface IPedido {
    itens: IItemPedido[]
}

interface IResultadoPedido {
    subtotal: number
    desconto: number
    taxaEntrega: number
    valorTotal: number
    ehValido: boolean
}

// ==================== DADOS ====================

const cardapio: IPizza[] = [
    { id: 1, nome: 'Margherita', tamanho: 'P', preco: 25.00 },
    { id: 2, nome: 'Calabresa', tamanho: 'M', preco: 35.00 },
    { id: 3, nome: 'Quatro Queijos', tamanho: 'G', preco: 50.00 },
    { id: 4, nome: 'Portuguesa', tamanho: 'GG', preco: 65.00 },
    { id: 5, nome: 'Frango com Catupiry', tamanho: 'G', preco: 50.00 },
    { id: 6, nome: 'Pepperoni', tamanho: 'M', preco: 35.00 },
]

// ==================== FUNÇÃO A IMPLEMENTAR ====================

function calcularPedido(pedido: IPedido): IResultadoPedido {
    const PRECO_BORDA = 8
    const TAXA_ENTREGA = 7
    const LIMITE_FRETE_GRATIS = 80
    const PEDIDO_MINIMO = 20
    const MAX_PIZZAS = 5
    const PERCENTUAL_DESCONTO = 0.1
    const MIN_PIZZAS_GG_PROMOCAO = 2


    if (pedido.itens.length === 0) {
        return { subtotal: 0, desconto: 0, taxaEntrega: 0, valorTotal: 0, ehValido: false }
    }

    const totalPizzas = pedido.itens.reduce((soma, item) => soma + item.quantidade, 0)
    if (totalPizzas > MAX_PIZZAS) {
        return { subtotal: 0, desconto: 0, taxaEntrega: 0, valorTotal: 0, ehValido: false }
    }


    let subtotal = 0
    for (const item of pedido.itens) {
        const pizza = cardapio.find(p => p.id === item.pizzaId)
        if (!pizza) continue
        const precoBorda = item.bordaRecheada ? PRECO_BORDA : 0
        subtotal += item.quantidade * (pizza.preco + precoBorda)
    }

    if (subtotal < PEDIDO_MINIMO) {
        return { subtotal, desconto: 0, taxaEntrega: 0, valorTotal: subtotal, ehValido: false }
    }


    let totalPizzasGrandesOuGG = 0
    for (const item of pedido.itens) {
        const pizza = cardapio.find(p => p.id === item.pizzaId)
        if (pizza && (pizza.tamanho === 'G' || pizza.tamanho === 'GG')) {
            totalPizzasGrandesOuGG += item.quantidade
        }
    }


    const desconto = totalPizzasGrandesOuGG >= MIN_PIZZAS_GG_PROMOCAO
        ? parseFloat((subtotal * PERCENTUAL_DESCONTO).toFixed(2))
        : 0


    const taxaEntrega = subtotal > LIMITE_FRETE_GRATIS ? 0 : TAXA_ENTREGA


    const valorTotal = parseFloat((subtotal - desconto + taxaEntrega).toFixed(2))

    return { subtotal, desconto, taxaEntrega, valorTotal, ehValido: true }
}

// ==================== TESTES ====================

// Teste 1: Pedido simples 1 pizza P sem borda — com frete
// Itens: 1x Margherita P (R$25) = R$25 + R$7 frete = R$32
const teste1 = calcularPedido({
    itens: [{ pizzaId: 1, quantidade: 1, bordaRecheada: false }]
})
validar({ descricao: 'calcularPedido() - Pedido simples com frete', atual: teste1.valorTotal, esperado: 32 })

// Teste 2: Pedido acima de R$80 — frete grátis
// Itens: 2x Quatro Queijos G (R$100) = R$100 — frete grátis
// Promoção: 2 pizzas G → 10% desconto = R$10
// Total: 100 - 10 = R$90
const teste2 = calcularPedido({
    itens: [{ pizzaId: 3, quantidade: 2, bordaRecheada: false }]
})
validar({ descricao: 'calcularPedido() - Frete grátis acima de R$80', atual: teste2.valorTotal, esperado: 90 })

// Teste 3: Pedido com borda recheada
// Itens: 1x Calabresa M (R$35) + borda (R$8) = R$43 + R$7 frete = R$50
const teste3 = calcularPedido({
    itens: [{ pizzaId: 2, quantidade: 1, bordaRecheada: true }]
})
validar({ descricao: 'calcularPedido() - Pedido com borda recheada', atual: teste3.valorTotal, esperado: 50 })

// Teste 4: Promoção — 2 pizzas G → 10% de desconto
// Itens: 1x Quatro Queijos G (R$50) + 1x Frango G (R$50) = R$100
// Promoção: 2 pizzas G → desconto 10% = R$10
// Frete grátis (100 > 80)
// Total: 100 - 10 = R$90
const teste4 = calcularPedido({
    itens: [
        { pizzaId: 3, quantidade: 1, bordaRecheada: false },
        { pizzaId: 5, quantidade: 1, bordaRecheada: false }
    ]
})
validar({ descricao: 'calcularPedido() - Promoção 2 pizzas G', atual: teste4.desconto, esperado: 10 })

// Teste 5: Pedido abaixo do mínimo R$20 — inválido
// Não existe pizza abaixo de R$20 no cardápio, mas podemos testar com quantidade 0
// Na verdade, pizza P = R$25 > R$20, então vamos testar com pedido vazio
// Cenário alternativo: caso de subtotal muito baixo não se aplica aqui
// Vamos validar que o pedido mínimo é respeitado via ehValido
const teste5 = calcularPedido({
    itens: []
})
validar({ descricao: 'calcularPedido() - Pedido vazio deve ser inválido', atual: teste5.ehValido, esperado: false })

// Teste 6: Pedido vazio — deve retornar inválido
const teste6 = calcularPedido({
    itens: []
})
validar({ descricao: 'calcularPedido() - Pedido sem itens inválido', atual: teste6.valorTotal, esperado: 0 })

// Teste 7: Pedido com mais de 5 pizzas — inválido
// 6x Margherita P = quantidade total 6 > 5
const teste7 = calcularPedido({
    itens: [{ pizzaId: 1, quantidade: 6, bordaRecheada: false }]
})
validar({ descricao: 'calcularPedido() - Mais de 5 pizzas inválido', atual: teste7.ehValido, esperado: false })

// Teste 8: Pizza GG com borda + frete grátis
// Itens: 1x Portuguesa GG (R$65) + borda (R$8) = R$73 + 1x Calabresa M (R$35) = R$108
// Promoção: apenas 1 pizza GG → sem desconto
// Frete grátis (108 > 80)
// Total: R$108
const teste8 = calcularPedido({
    itens: [
        { pizzaId: 4, quantidade: 1, bordaRecheada: true },
        { pizzaId: 2, quantidade: 1, bordaRecheada: false }
    ]
})
validar({ descricao: 'calcularPedido() - GG com borda + frete grátis', atual: teste8.valorTotal, esperado: 108 })

// Teste 9: Mix — 1 pizza P + 1 pizza G com borda
// Itens: 1x Margherita P (R$25) + 1x Quatro Queijos G (R$50) + borda (R$8) = R$83
// Promoção: apenas 1 pizza G → sem desconto
// Frete grátis (83 > 80)
// Total: R$83
const teste9 = calcularPedido({
    itens: [
        { pizzaId: 1, quantidade: 1, bordaRecheada: false },
        { pizzaId: 3, quantidade: 1, bordaRecheada: true }
    ]
})
validar({ descricao: 'calcularPedido() - Mix P + G com borda', atual: teste9.valorTotal, esperado: 83 })

// Teste 10: Promoção + frete grátis (cenário completo)
// Itens: 2x Portuguesa GG (R$130) + borda em ambas (R$16) = R$146
// Promoção: 2 pizzas GG → desconto 10% do subtotal = R$14.60
// Frete grátis (146 > 80)
// Total: 146 - 14.60 = R$131.40
const teste10 = calcularPedido({
    itens: [{ pizzaId: 4, quantidade: 2, bordaRecheada: true }]
})
validar({ descricao: 'calcularPedido() - Promoção + frete grátis completo', atual: teste10.valorTotal, esperado: 131.40 })
