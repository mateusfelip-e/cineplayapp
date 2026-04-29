import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Animação das seções ao entrar na tela
export const useAnimacaoSecao = (ref) => {
  useEffect(() => {
    if (!ref.current) return

    const secoes = ref.current.querySelectorAll('.secao')

    secoes.forEach((secao) => {
      gsap.fromTo(secao,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: secao,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])
}

// Animação dos títulos das seções
export const useAnimacaoTitulos = (ref) => {
  useEffect(() => {
    if (!ref.current) return

    const titulos = ref.current.querySelectorAll('.secao h2, .secao-titulo-wrapper h2')

    titulos.forEach((titulo) => {
      gsap.fromTo(titulo,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titulo,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])
}

// Animação dos cards em cascata
export const useAnimacaoCards = (ref) => {
  useEffect(() => {
    if (!ref.current) return

    const listas = ref.current.querySelectorAll('.lista-cards, .slider-track')

    listas.forEach((lista) => {
      const cards = lista.querySelectorAll('.card')

      gsap.fromTo(cards,
        { opacity: 0, y: 30, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: lista,
            start: 'top 88%',
            toggleActions: 'play none none none'
          }
        }
      )
    })

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])
}

// Animação dos stats do perfil (contador)
export const useAnimacaoStats = (ref) => {
  useEffect(() => {
    if (!ref.current) return

    const stats = ref.current.querySelectorAll('.perfil-stat, .stat-card')

    gsap.fromTo(stats,
      { opacity: 0, y: 20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'back.out(1.4)',
        stagger: 0.08,
        scrollTrigger: {
          trigger: stats[0],
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    )

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])
}

// Animação parallax do Hero
export const useAnimacaoHero = (ref) => {
  useEffect(() => {
    if (!ref.current) return

    const hero = ref.current.querySelector('.hero')
    const conteudo = ref.current.querySelector('.hero-conteudo')

    if (hero) {
      gsap.to(hero, {
        backgroundPositionY: '30%',
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
    }

    if (conteudo) {
      gsap.to(conteudo, {
        y: -50,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill())
  }, [])
}