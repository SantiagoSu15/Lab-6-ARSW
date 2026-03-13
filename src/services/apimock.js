localStorage.setItem('token', 'mock-token-123')


const mockData = [
  {
    author: 'juan',
    name: 'blueprint1',
    points: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
  },
  {
    author: 'juan',
    name: 'blueprint2',
    points: [{ x: 5, y: 15 }],
  },
  {
    author: 'juan',
    name: 'blueprint3',
    points: [{ x: 1, y: 2 }, { x: 8, y: 9 }, { x: 20, y: 5 }],
  },
  {
    author: 'maria',
    name: 'blueprint1',
    points: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 6 }],
  },
  {
    author: 'maria',
    name: 'blueprint2',
    points: [{ x: 7, y: 8 }],
  },
  {
    author: 'pedro',
    name: 'blueprint1',
    points: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
  },
]
  const apimock = {
    getAll: async () => mockData,
  
    getByAuthor: async (author) =>
      mockData.filter((bp) => bp.author === author),
  
    getByAuthorAndBluePoint: async (author, name) =>
      mockData.find((bp) => bp.author === author && bp.name === name) || null,
  
    create: async (blueprint) => {
      mockData.push(blueprint)
      return blueprint
    },
  }
  
  export default apimock