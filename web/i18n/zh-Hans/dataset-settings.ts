const translation = {
  title: '知识库设置',
  desc: '在这里，您可以修改此知识库的属性和检索设置',
  form: {
    name: '知识库名称',
    namePlaceholder: '请输入知识库名称',
    nameError: '名称不能为空',
    desc: '知识库描述',
    descInfo: '请写出清楚的文字描述来概述知识库的内容。当从多个知识库中进行选择匹配时，该描述将用作匹配的基础。',
    descPlaceholder: '请描述这个知识库包含的内容（可选）',
    descWrite: '了解如何编写更好的知识库描述。',
    permissions: '可见权限',
    permissionsOnlyMe: '只有我',
    permissionsAllMember: '所有人',
    permissionsInvitedMembers: '部分团队成员',
    me: '（你）',
    indexMethod: '索引模式',
    indexMethodHighQuality: '高质量',
    indexMethodHighQualityTip: '调用 Embedding 模型进行处理，以在用户查询时提供更高的准确度。',
    indexMethodEconomy: '经济',
    indexMethodEconomyTip: '使用离线的向量引擎、关键词索引等方式，降低了准确度但无需花费 Token',
    embeddingModel: 'Embedding 模型',
    embeddingModelTip: '修改 Embedding 模型，请去',
    embeddingModelTipLink: '设置',
    retrievalSetting: {
      title: '检索设置',
      learnMore: '了解更多',
      description: '关于检索方法。',
      longDescription: '关于检索方法，您可以随时在知识库设置中更改此设置。',
    },
    externalKnowledgeAPI: '外部知识 API',
    externalKnowledgeID: '外部知识库 ID',
    save: '保存',
    retrievalSettings: '检索设置',
  },
}

export default translation
