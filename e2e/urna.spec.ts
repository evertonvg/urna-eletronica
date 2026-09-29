import { expect, test } from '@playwright/test'

const teclas = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'branco', 'corrige', 'confirma']

test.beforeEach(async ({ page }) => {
  // Registra os áudios tocados (sem tocar de verdade).
  await page.addInitScript(() => {
    const w = window as unknown as { tocados: string[] }
    w.tocados = []
    HTMLMediaElement.prototype.play = function () {
      w.tocados.push(this.src)
      return Promise.resolve()
    }
  })
  await page.setViewportSize({ width: 1000, height: 760 })
  await page.goto('/')
  await expect(page.getByTestId('tela')).toContainText('SEU VOTO PARA')
})

test('renderiza a tela e todas as teclas', async ({ page }) => {
  await expect(page.getByTestId('tela')).toBeVisible()
  for (const tecla of teclas) {
    await expect(page.locator(`[data-key="${tecla}"]`)).toBeVisible()
  }
  await page.screenshot({ path: 'screenshots/urna.png' })
})

test('vota em um candidato a presidente e confirma', async ({ page }) => {
  await page.locator('[data-key="1"]').click()
  await page.locator('[data-key="3"]').click()

  const tela = page.getByTestId('tela')
  await expect(tela).toContainText(/lula/i)
  await expect(tela).toContainText('PT')
  await expect(tela).toContainText('Vice-Presidente')
  await page.screenshot({ path: 'screenshots/urna-candidato.png' })

  await page.locator('[data-key="confirma"]').click()
  await expect(tela).toContainText('FIM')
  expect(await page.evaluate(() => (window as unknown as { tocados: string[] }).tocados)).toEqual([
    expect.stringContaining('confirma-urna'),
  ])
})

test('número inexistente vira voto nulo e corrige limpa', async ({ page }) => {
  await page.keyboard.press('9')
  await page.keyboard.press('9')
  await expect(page.getByTestId('tela')).toContainText('VOTO NULO')

  await page.keyboard.press('Backspace')
  await expect(page.getByTestId('tela')).not.toContainText('VOTO NULO')
})

test('voto em branco', async ({ page }) => {
  await page.locator('[data-key="branco"]').click()
  await expect(page.getByTestId('tela')).toContainText('VOTO EM BRANCO')
})

test('abre na eleição de 2026 com os candidatos deste ano', async ({ page }) => {
  await expect(page.getByText('Eleições 2026 · Presidente da República')).toBeVisible()
  await expect(page.getByText('13 candidatos em 2026')).toBeVisible()

  await page.keyboard.press('1')
  await page.keyboard.press('4')
  const tela = page.getByTestId('tela')
  await expect(tela).toContainText(/renan santos/i)
  await expect(tela).toContainText('MISSÃO')
  await expect(tela).toContainText(/coronel medina/i)
  await expect(page.getByTestId('foto-candidato')).toHaveAttribute('src', '/candidatos/2026/14.jpg')
  await expect(page.getByTestId('foto-candidato')).toHaveJSProperty('complete', true)
  await expect(page.getByTestId('credito-foto')).toContainText('Renan Santos')
  await page.screenshot({ path: 'screenshots/urna-2026.png' })
})

test('voto no 22 abre o modal e não chega ao FIM', async ({ page }) => {
  await page.keyboard.press('2')
  await page.keyboard.press('2')
  await page.locator('[data-key="confirma"]').click()

  const modal = page.getByRole('alertdialog')
  await expect(modal).toContainText('Que pessoa burra!')
  await page.screenshot({ path: 'screenshots/urna-22.png' })

  // Teclas da urna ficam travadas enquanto o modal está aberto.
  await page.locator('[data-key="confirma"]').click({ force: true })
  const tela = page.getByTestId('tela')
  await expect(tela).not.toContainText('FIM')
  expect(await page.evaluate(() => (window as unknown as { tocados: string[] }).tocados)).toEqual([])

  // Fechar o modal limpa o voto.
  await page.keyboard.press('Enter')
  await expect(modal).toBeHidden()
  await expect(tela).not.toContainText(/flávio bolsonaro/i)
  await expect(page.getByTestId('digito').first()).toHaveText('')
})
