export const ERROR_MESSAGES = {
    USER_NOT_FOUND: (id: number) => `Usuário com ID ${id} não encontrado na base de dados.`,
    INVALID_CREDENTIALS: 'Credenciais inválidas.',
    EMAIL_IN_USE: 'Este email já está em uso.',
    USER_ALREADY_EXISTS: 'Este usuário já existe.',
    MISSING_NAME: 'Campo nome é obrigatório.',
    MISSING_EMAIL: 'Campo email é obrigatório.',
    MISSING_PASSWORD: 'Campo senha é obrigatória.',
    MISSING_URL: 'Campo URL original é obrigatório.',
    URL_NOT_FOUND: 'URL não encontrada.',
    NO_URLS_FOUND: 'Nenhuma URL encontrada para este usuário.',
    UNAUTHORIZED_URL_ACCESS: 'Você não tem permissão para alterar ou excluir esta URL.',
    SERVER_ERROR: 'Erro interno no servidor.',
    TOKEN_MISSING: 'Token não fornecido.',
    TOKEN_INVALID: 'Token inválido.',
    TOKEN_EXPIRED: 'Token expirado, faça login novamente.',
  };
  