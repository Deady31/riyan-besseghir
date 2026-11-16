// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Toys = typeof import('../src/lib/toys')
type Bus = typeof import('../src/lib/cursorBus')
let toys: Toys
let bus: Bus
let now = 0
let hit: Element | null = null
let disposers: (() => void)[] = []

function body(x: number, y: number, r: number, front: boolean) {
  const b = toys.createBody(front, 1)
  Object.assign(b, { x, y, r, visible: true })
  toys.bodies.add(b)
  return b
}

function mouse(type: string, x: number, y: number, button = 0) {
  const e = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true, cancelable: true })
  Object.defineProperty(e, 'pointerType', { value: 'mouse' })
  window.dispatchEvent(e)
  return e
}

const at = (t: number) => {
  now = t
}
const main = () => document.getElementById('m')!

beforeEach(async () => {
  vi.resetModules()
  now = 1000
  hit = null
  disposers = []
  vi.spyOn(performance, 'now').mockImplementation(() => now)
  const m = document.createElement('main')
  m.id = 'm'
  document.body.replaceChildren(m)
  document.elementFromPoint = () => hit
  toys = await import('../src/lib/toys')
  bus = await import('../src/lib/cursorBus')
  const burst = await import('../src/lib/burst')
  burst.setBurstEnabled(false)
})

afterEach(() => {
  disposers.forEach((d) => d())
  vi.restoreAllMocks()
})

const mount = () => {
  const off = toys.useToysInput()
  disposers.push(off)
  return off
}

describe('pick', () => {
  it('renvoie null si rien n\'est à portée ou si l\'objet est invisible', () => {
    const b = body(100, 100, 40, true)
    expect(toys.pick(300, 300, false)).toBeNull()
    b.visible = false
    expect(toys.pick(100, 100, false)).toBeNull()
  })

  it('le calque avant gagne même si l\'objet du fond est plus près', () => {
    body(100, 100, 40, false)
    const front = body(125, 100, 40, true)
    hit = main()
    expect(toys.pick(100, 100, false)).toBe(front)
  })

  it('à calque égal, le plus proche (relatif au rayon) gagne', () => {
    const a = body(100, 100, 40, true)
    const b = body(130, 100, 40, true)
    expect(toys.pick(105, 100, false)).toBe(a)
    expect(toys.pick(128, 100, false)).toBe(b)
  })

  it('rayon tactile minimum 34 px, rayon souris inchangé', () => {
    const b = body(100, 100, 10, true)
    expect(toys.pick(130, 100, false)).toBeNull()
    expect(toys.pick(130, 100, true)).toBe(b)
    expect(toys.pick(140, 100, true)).toBeNull()
  })

  it('rayon tactile = 1,15 x r quand r est grand', () => {
    const b = body(100, 100, 100, true)
    expect(toys.pick(210, 100, true)).toBe(b)
    expect(toys.pick(210, 100, false)).toBeNull()
  })

  describe('objet du fond et occlusion', () => {
    const plain = (css: Partial<CSSStyleDeclaration> = {}) => {
      const d = document.createElement('div')
      d.style.backgroundImage = 'none'
      Object.assign(d.style, css)
      main().append(d)
      hit = d
      return d
    }

    it('attrapable si l\'élément dessous est transparent', () => {
      const b = body(100, 100, 40, false)
      plain({ backgroundColor: 'rgba(0, 0, 0, 0.02)' })
      expect(toys.pick(100, 100, false)).toBe(b)
    })

    it.each(['a', 'button', 'img', 'input', 'header'])('caché par un <%s>', (tag) => {
      body(100, 100, 40, false)
      const el = document.createElement(tag)
      main().append(el)
      hit = el
      expect(toys.pick(100, 100, false)).toBeNull()
    })

    it('caché par un enfant d\'un lien', () => {
      body(100, 100, 40, false)
      const a = document.createElement('a')
      const span = document.createElement('span')
      a.append(span)
      main().append(a)
      hit = span
      expect(toys.pick(100, 100, false)).toBeNull()
    })

    it('caché par un élément [data-no-grab]', () => {
      body(100, 100, 40, false)
      plain().setAttribute('data-no-grab', '')
      expect(toys.pick(100, 100, false)).toBeNull()
    })

    it('caché par un bloc de couleur opaque ou semi-opaque (> 0,06)', () => {
      body(100, 100, 40, false)
      const d = plain({ backgroundColor: 'rgb(240, 82, 53)' })
      expect(toys.pick(100, 100, false)).toBeNull()
      d.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'
      expect(toys.pick(100, 100, false)).toBeNull()
    })

    it('caché par une image de fond CSS', () => {
      body(100, 100, 40, false)
      plain({ backgroundImage: 'linear-gradient(red, blue)' })
      expect(toys.pick(100, 100, false)).toBeNull()
    })

    it('caché par un ancêtre opaque (remonte jusqu\'à <main>)', () => {
      body(100, 100, 40, false)
      const outer = document.createElement('section')
      outer.style.backgroundColor = 'rgb(255, 255, 255)'
      outer.style.backgroundImage = 'none'
      const inner = document.createElement('div')
      inner.style.backgroundImage = 'none'
      outer.append(inner)
      main().append(outer)
      hit = inner
      expect(toys.pick(100, 100, false)).toBeNull()
    })

    it('un fond opaque sur <main> lui-même ne cache pas l\'objet', () => {
      const b = body(100, 100, 40, false)
      main().style.backgroundColor = 'rgb(255, 255, 255)'
      hit = main()
      expect(toys.pick(100, 100, false)).toBe(b)
    })

    it('rien sous le point (elementFromPoint = null) : attrapable', () => {
      const b = body(100, 100, 40, false)
      hit = null
      expect(toys.pick(100, 100, false)).toBe(b)
    })

    it('un objet du calque avant n\'est jamais caché', () => {
      const b = body(100, 100, 40, true)
      const btn = document.createElement('button')
      document.body.append(btn)
      hit = btn
      expect(toys.pick(100, 100, false)).toBe(b)
    })

    it('un objet du fond caché laisse passer un objet du calque avant au même endroit', () => {
      body(100, 100, 40, false)
      const f = body(100, 100, 40, true)
      hit = document.createElement('button')
      expect(toys.pick(100, 100, false)).toBe(f)
    })
  })
})

describe('geste : tap contre lancer', () => {
  it('un tap bref repousse l\'objet à l\'opposé du doigt (600 px/s, -120 en y)', () => {
    const b = body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 110, 100)
    expect(b.held).toBe(true)
    expect(bus.cursorBus.dragging).toBe(true)
    at(1100)
    mouse('pointerup', 110, 100)
    expect(b.held).toBe(false)
    expect(bus.cursorBus.dragging).toBe(false)
    expect(b.vx).toBeCloseTo(-600, 3)
    expect(b.vy).toBeCloseTo(-120, 3)
  })

  it('un tap pile au centre pousse dans une direction aléatoire de norme 600', () => {
    const b = body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 100, 100)
    at(1050)
    mouse('pointerup', 100, 100)
    expect(Math.hypot(b.vx, b.vy + 120)).toBeCloseTo(600, 3)
  })

  it('un appui long immobile (> 380 ms) n\'est pas un tap : l\'objet est posé', () => {
    const b = body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 110, 100)
    at(1500)
    mouse('pointerup', 110, 100)
    expect(b.vx).toBe(0)
    expect(b.vy).toBe(0)
  })

  it('un lancer prend la vitesse sur les derniers 180 ms', () => {
    const b = body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 100, 100)
    at(1100)
    mouse('pointermove', 150, 100)
    at(1150)
    mouse('pointermove', 250, 100)
    at(1160)
    mouse('pointerup', 250, 100)
    expect(b.vx).toBeCloseTo(1000, 3) // 150 px en 0,15 s
    expect(b.vy).toBeCloseTo(0, 3)
  })

  it('les points plus vieux que 180 ms sont ignorés', () => {
    const b = body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 100, 100) // t=1000
    at(1100)
    mouse('pointermove', 500, 100)
    at(1250)
    mouse('pointermove', 510, 100)
    at(1300)
    mouse('pointermove', 530, 100)
    mouse('pointerup', 530, 100)
    expect(b.vx).toBeCloseTo(400, 3) // (510,1250) -> (530,1300)
  })

  it('la vitesse est plafonnée à 2400 px/s', () => {
    const b = body(500, 500, 40, true)
    mount()
    mouse('pointerdown', 500, 500)
    at(1020)
    mouse('pointermove', 1500, 500)
    mouse('pointerup', 1500, 500)
    expect(b.vx).toBe(2400)
  })

  it('geste arrêté avant le lâcher : posé, sans lancer', () => {
    const b = body(100, 100, 40, true)
    b.vx = 123
    b.vy = -77
    mount()
    mouse('pointerdown', 100, 100)
    at(1050)
    mouse('pointermove', 300, 100)
    at(1600)
    mouse('pointerup', 300, 100)
    expect(b.vx).toBe(0)
    expect(b.vy).toBe(0)
    expect(b.held).toBe(false)
  })

  it('la cible suit le doigt moins le décalage de prise, bornée à l\'écran', () => {
    const b = body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 110, 100)
    mouse('pointermove', 210, 150)
    expect(b.tx).toBe(200)
    expect(b.ty).toBe(150)
    mouse('pointermove', -500, -500)
    expect(b.tx).toBe(20) // marge = min(r*0.5, 80)
    expect(b.ty).toBe(20)
  })
})

describe('entrées souris', () => {
  it('pas de prise avec le bouton droit', () => {
    const b = body(100, 100, 40, true)
    mount()
    const e = mouse('pointerdown', 100, 100, 2)
    expect(b.held).toBe(false)
    expect(e.defaultPrevented).toBe(false)
  })

  it('un geste hors objet est ignoré (pas de preventDefault)', () => {
    const b = body(100, 100, 40, true)
    mount()
    const e = mouse('pointerdown', 600, 600)
    expect(b.held).toBe(false)
    expect(e.defaultPrevented).toBe(false)
    expect(bus.cursorBus.dragging).toBe(false)
  })

  it('un geste sur un objet appelle preventDefault', () => {
    body(100, 100, 40, true)
    mount()
    expect(mouse('pointerdown', 100, 100).defaultPrevented).toBe(true)
  })

  it('cursorBus.overGrab suit le survol', () => {
    body(100, 100, 40, true)
    mount()
    mouse('pointermove', 100, 100)
    expect(bus.cursorBus.overGrab).toBe(true)
    mouse('pointermove', 600, 600)
    expect(bus.cursorBus.overGrab).toBe(false)
  })

  it('un pointeur non souris est ignoré par les écouteurs souris', () => {
    const b = body(100, 100, 40, true)
    mount()
    const e = new MouseEvent('pointerdown', { clientX: 100, clientY: 100, button: 0, bubbles: true })
    Object.defineProperty(e, 'pointerType', { value: 'touch' })
    window.dispatchEvent(e)
    expect(b.held).toBe(false)
  })
})

describe('clic avalé après un geste', () => {
  function clickOnButton() {
    const btn = document.createElement('button')
    document.body.append(btn)
    const seen = vi.fn()
    btn.addEventListener('click', seen)
    const e = new MouseEvent('click', { bubbles: true, cancelable: true })
    btn.dispatchEvent(e)
    return { seen, e }
  }

  const gesture = () => {
    body(100, 100, 40, true)
    mount()
    mouse('pointerdown', 100, 100)
    at(1050)
    mouse('pointerup', 100, 100)
  }

  it('le clic dans les 450 ms après un geste est avalé', () => {
    gesture()
    at(1300)
    const { seen, e } = clickOnButton()
    expect(seen).not.toHaveBeenCalled()
    expect(e.defaultPrevented).toBe(true)
  })

  it('le clic après 450 ms passe normalement', () => {
    gesture()
    at(1600)
    const { seen, e } = clickOnButton()
    expect(seen).toHaveBeenCalledTimes(1)
    expect(e.defaultPrevented).toBe(false)
  })

  it('sans geste, les clics ne sont jamais avalés', () => {
    mount()
    const { seen } = clickOnButton()
    expect(seen).toHaveBeenCalledTimes(1)
  })
})

describe('useToysInput : installation et désinstallation', () => {
  it('une seule série d\'écouteurs même avec plusieurs utilisateurs', () => {
    const add = vi.spyOn(window, 'addEventListener')
    mount()
    const first = add.mock.calls.length
    expect(first).toBeGreaterThan(0)
    mount()
    expect(add.mock.calls.length).toBe(first)
  })

  it('retire exactement ce qui a été ajouté quand le dernier utilisateur part', () => {
    const add = vi.spyOn(window, 'addEventListener')
    const rem = vi.spyOn(window, 'removeEventListener')
    const rootAdd = vi.spyOn(document.documentElement, 'addEventListener')
    const rootRem = vi.spyOn(document.documentElement, 'removeEventListener')
    const a = mount()
    const b = mount()
    a()
    expect(rem).not.toHaveBeenCalled()
    b()
    const cap = (o: unknown) => (typeof o === 'boolean' ? o : !!(o as AddEventListenerOptions | undefined)?.capture)
    expect(rem.mock.calls.length).toBe(add.mock.calls.length)
    for (const [type, fn, opts] of add.mock.calls) {
      expect(rem.mock.calls.some(([t, f, o]) => t === type && f === fn && cap(o) === cap(opts))).toBe(true)
    }
    expect(rootRem.mock.calls.map((c) => c[0])).toEqual(rootAdd.mock.calls.map((c) => c[0]))
  })

  it('après désinstallation plus rien ne réagit et le bus est remis à zéro', () => {
    const b = body(100, 100, 40, true)
    const off = mount()
    mouse('pointerdown', 100, 100)
    expect(bus.cursorBus.dragging).toBe(true)
    off()
    expect(bus.cursorBus.dragging).toBe(false)
    expect(bus.cursorBus.overGrab).toBe(false)
    b.held = false
    mouse('pointerdown', 100, 100)
    expect(b.held).toBe(false)
  })

  it('on peut réinstaller après une désinstallation complète', () => {
    const b = body(100, 100, 40, true)
    mount()()
    mount()
    mouse('pointerdown', 100, 100)
    expect(b.held).toBe(true)
  })

  it('un double appel de la désinstallation ne retire pas les écouteurs du second utilisateur', () => {
    const b = body(100, 100, 40, true)
    const off1 = toys.useToysInput()
    const off2 = toys.useToysInput()
    off1()
    off1()
    disposers.push(off2)
    mouse('pointerdown', 100, 100)
    expect(b.held).toBe(true)
  })
})
