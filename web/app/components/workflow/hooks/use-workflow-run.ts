import { useCallback } from 'react'
import {
  useReactFlow,
  useStoreApi,
} from 'reactflow'
import produce from 'immer'
import { v4 as uuidV4 } from 'uuid'
import { usePathname } from 'next/navigation'
import { useWorkflowStore } from '../store'
import { useNodesSyncDraft } from '../hooks'
import {
  BlockEnum,
  NodeRunningStatus,
  WorkflowRunningStatus,
} from '../types'
import { DEFAULT_ITER_TIMES } from '../constants'
import { useWorkflowUpdate } from './use-workflow-interactions'
import { useStore as useAppStore } from '@/app/components/app/store'
import type { IOtherOptions } from '@/service/base'
import { ssePost } from '@/service/base'
import {
  fetchPublishedWorkflow,
  stopWorkflowRun,
} from '@/service/workflow'
import { useFeaturesStore } from '@/app/components/base/features/hooks'
import { AudioPlayerManager } from '@/app/components/base/audio-btn/audio.player.manager'
import {
  getFilesInLogs,
} from '@/app/components/base/file-uploader/utils'
import { ErrorHandleTypeEnum } from '@/app/components/workflow/nodes/_base/components/error-handle/types'

// takin command:扣费
import { updateCreditsByWorkflow } from '@/app/api/pricing'
import { useAppContext } from '@/context/app-context'
export const useWorkflowRun = () => {
  const { userProfile, updateCreditsWithoutRerender } = useAppContext()
  const store = useStoreApi()
  const workflowStore = useWorkflowStore()
  const reactflow = useReactFlow()
  const featuresStore = useFeaturesStore()
  const { doSyncWorkflowDraft } = useNodesSyncDraft()
  const { handleUpdateWorkflowCanvas } = useWorkflowUpdate()
  const pathname = usePathname()

  const handleBackupDraft = useCallback(() => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const { getViewport } = reactflow
    const {
      backupDraft,
      setBackupDraft,
      environmentVariables,
    } = workflowStore.getState()
    const { features } = featuresStore!.getState()

    if (!backupDraft) {
      setBackupDraft({
        nodes: getNodes(),
        edges,
        viewport: getViewport(),
        features,
        environmentVariables,
      })
      doSyncWorkflowDraft()
    }
  }, [reactflow, workflowStore, store, featuresStore, doSyncWorkflowDraft])

  const handleLoadBackupDraft = useCallback(() => {
    const {
      backupDraft,
      setBackupDraft,
      setEnvironmentVariables,
    } = workflowStore.getState()

    if (backupDraft) {
      const {
        nodes,
        edges,
        viewport,
        features,
        environmentVariables,
      } = backupDraft
      handleUpdateWorkflowCanvas({
        nodes,
        edges,
        viewport,
      })
      setEnvironmentVariables(environmentVariables)
      featuresStore!.setState({ features })
      setBackupDraft(undefined)
    }
  }, [handleUpdateWorkflowCanvas, workflowStore, featuresStore])

  const handleRun = useCallback(async (
    params: any,
    callback?: IOtherOptions,
  ) => {
    const {
      getNodes,
      setNodes,
    } = store.getState()
    const newNodes = produce(getNodes(), (draft) => {
      draft.forEach((node) => {
        node.data.selected = false
        node.data._runningStatus = undefined
      })
    })
    setNodes(newNodes)
    await doSyncWorkflowDraft()

    const {
      onWorkflowStarted,
      onWorkflowFinished,
      onNodeStarted,
      onNodeFinished,
      onIterationStart,
      onIterationNext,
      onIterationFinish,
      onError,
      ...restCallback
    } = callback || {}
    workflowStore.setState({ historyWorkflowData: undefined })
    const appDetail = useAppStore.getState().appDetail
    const workflowContainer = document.getElementById('workflow-container')

    const {
      clientWidth,
      clientHeight,
    } = workflowContainer!

    let url = ''
    if (appDetail?.mode === 'advanced-chat')
      url = `/apps/${appDetail.id}/advanced-chat/workflows/draft/run`

    if (appDetail?.mode === 'workflow')
      url = `/apps/${appDetail.id}/workflows/draft/run`

    let prevNodeId = ''

    const {
      setWorkflowRunningData,
    } = workflowStore.getState()
    setWorkflowRunningData({
      result: {
        status: WorkflowRunningStatus.Running,
      },
      tracing: [],
      resultText: '',
    })

    let ttsUrl = ''
    let ttsIsPublic = false
    if (params.token) {
      ttsUrl = '/text-to-audio'
      ttsIsPublic = true
    }
    else if (params.appId) {
      if (pathname.search('explore/installed') > -1)
        ttsUrl = `/installed-apps/${params.appId}/text-to-audio`
      else
        ttsUrl = `/apps/${params.appId}/text-to-audio`
    }
    const player = AudioPlayerManager.getInstance().getAudioPlayer(ttsUrl, ttsIsPublic, uuidV4(), 'none', 'none', (_: any): any => {})

    ssePost(
      url,
      {
        body: params,
      },
      {
        onWorkflowStarted: (params) => {
          const { task_id, data } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
            setIterParallelLogMap,
          } = workflowStore.getState()
          const {
            getNodes,
            setNodes,
            edges,
            setEdges,
          } = store.getState()
          setIterParallelLogMap(new Map())
          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            draft.task_id = task_id
            draft.result = {
              ...draft?.result,
              ...data,
              status: WorkflowRunningStatus.Running,
            }
          }))
          const nodes = getNodes()
          const newNodes = produce(nodes, (draft) => {
            draft.forEach((node) => {
              node.data._waitingRun = true
              node.data._runningBranchId = undefined
            })
          })
          setNodes(newNodes)
          const newEdges = produce(edges, (draft) => {
            draft.forEach((edge) => {
              edge.data = {
                ...edge.data,
                _sourceRunningStatus: undefined,
                _targetRunningStatus: undefined,
                _waitingRun: true,
              }
            })
          })
          setEdges(newEdges)

          if (onWorkflowStarted)
            onWorkflowStarted(params)
        },
        onWorkflowFinished: async (params) => {
          const { data } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
          } = workflowStore.getState()

          const isStringOutput = data.outputs && Object.keys(data.outputs).length === 1 && typeof data.outputs[Object.keys(data.outputs)[0]] === 'string'

          const newWorkflowRunningData = (produce(workflowRunningData!, (draft) => {
            draft.result = {
              ...draft.result,
              ...data,
              files: getFilesInLogs(data.outputs),
            } as any
            if (isStringOutput) {
              draft.resultTabActive = true
              draft.resultText = data.outputs[Object.keys(data.outputs)[0]]
            }
          }))
          setWorkflowRunningData(newWorkflowRunningData)

          prevNodeId = ''

          if (onWorkflowFinished)
            onWorkflowFinished(params)
          // takin command:需要将newWorkflowRunningData赋值，方便传输到扣费函数中
          // console.log('newWorkflowRunningData', newWorkflowRunningData)
          // await updateUserCreditsWithTotalToken(userProfile.takin_id!, newWorkflowRunningData.result.total_tokens || 0, 'Dify Workflow', newWorkflowRunningData)
          const cost = await updateCreditsByWorkflow({
            tracing: newWorkflowRunningData.tracing!,
          })
          const newCredits = parseFloat(((userProfile?.credits || 0) - cost).toFixed(2))
          updateCreditsWithoutRerender(newCredits)
        },
        onError: (params) => {
          const {
            workflowRunningData,
            setWorkflowRunningData,
          } = workflowStore.getState()

          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            draft.result = {
              ...draft.result,
              status: WorkflowRunningStatus.Failed,
            }
          }))

          if (onError)
            onError(params)
        },
        onNodeStarted: (params) => {
          const { data } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
            iterParallelLogMap,
            setIterParallelLogMap,
          } = workflowStore.getState()
          const {
            getNodes,
            setNodes,
            edges,
            setEdges,
            transform,
          } = store.getState()
          const nodes = getNodes()
          const node = nodes.find(node => node.id === data.node_id)
          if (node?.parentId) {
            setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
              const tracing = draft.tracing!
              const iterations = tracing.find(trace => trace.node_id === node?.parentId)
              const currIteration = iterations?.details![node.data.iteration_index] || iterations?.details![iterations.details!.length - 1]
              if (!data.parallel_run_id) {
                currIteration?.push({
                  ...data,
                  status: NodeRunningStatus.Running,
                } as any)
              }
              else {
                const nodeId = iterations?.node_id as string
                if (!iterParallelLogMap.has(nodeId as string))
                  iterParallelLogMap.set(iterations?.node_id as string, new Map())

                const currentIterLogMap = iterParallelLogMap.get(nodeId)!
                if (!currentIterLogMap.has(data.parallel_run_id))
                  currentIterLogMap.set(data.parallel_run_id, [{ ...data, status: NodeRunningStatus.Running } as any])
                else
                  currentIterLogMap.get(data.parallel_run_id)!.push({ ...data, status: NodeRunningStatus.Running } as any)
                setIterParallelLogMap(iterParallelLogMap)
                if (iterations)
                  iterations.details = Array.from(currentIterLogMap.values())
              }
            }))
          }
          else {
            setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
              draft.tracing!.push({
                ...data,
                status: NodeRunningStatus.Running,
              } as any)
            }))

            const {
              setViewport,
            } = reactflow
            const currentNodeIndex = nodes.findIndex(node => node.id === data.node_id)
            const currentNode = nodes[currentNodeIndex]
            const position = currentNode.position
            const zoom = transform[2]

            if (!currentNode.parentId) {
              setViewport({
                x: (clientWidth - 400 - currentNode.width! * zoom) / 2 - position.x * zoom,
                y: (clientHeight - currentNode.height! * zoom) / 2 - position.y * zoom,
                zoom: transform[2],
              })
            }
            const newNodes = produce(nodes, (draft) => {
              draft[currentNodeIndex].data._runningStatus = NodeRunningStatus.Running
              draft[currentNodeIndex].data._waitingRun = false
            })
            setNodes(newNodes)
            const newEdges = produce(edges, (draft) => {
              const incomeEdges = draft.filter((edge) => {
                return edge.target === data.node_id
              })

              incomeEdges.forEach((edge) => {
                const incomeNode = nodes.find(node => node.id === edge.source)!
                if (
                  (!incomeNode.data._runningBranchId && edge.sourceHandle === 'source')
                  || (incomeNode.data._runningBranchId && edge.sourceHandle === incomeNode.data._runningBranchId)
                ) {
                  edge.data = {
                    ...edge.data,
                    _sourceRunningStatus: incomeNode.data._runningStatus,
                    _targetRunningStatus: NodeRunningStatus.Running,
                    _waitingRun: false,
                  }
                }
              })
            })
            setEdges(newEdges)
          }
          if (onNodeStarted)
            onNodeStarted(params)
        },
        onNodeFinished: (params) => {
          const { data } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
            iterParallelLogMap,
            setIterParallelLogMap,
          } = workflowStore.getState()
          const {
            getNodes,
            setNodes,
            edges,
            setEdges,
          } = store.getState()
          const nodes = getNodes()
          const nodeParentId = nodes.find(node => node.id === data.node_id)!.parentId
          if (nodeParentId) {
            if (!data.execution_metadata.parallel_mode_run_id) {
              setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
                const tracing = draft.tracing!
                const iterations = tracing.find(trace => trace.node_id === nodeParentId) // the iteration node

                if (iterations && iterations.details) {
                  const iterationIndex = data.execution_metadata?.iteration_index || 0
                  if (!iterations.details[iterationIndex])
                    iterations.details[iterationIndex] = []

                  const currIteration = iterations.details[iterationIndex]
                  const nodeIndex = currIteration.findIndex(node =>
                    node.node_id === data.node_id && (
                      node.execution_metadata?.parallel_id === data.execution_metadata?.parallel_id || node.parallel_id === data.execution_metadata?.parallel_id),
                  )
                  if (nodeIndex !== -1) {
                    currIteration[nodeIndex] = {
                      ...currIteration[nodeIndex],
                      ...data,
                    } as any
                  }
                  else {
                    currIteration.push({
                      ...data,
                    } as any)
                  }
                }
              }))
            }
            else {
              // open parallel mode
              setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
                const tracing = draft.tracing!
                const iterations = tracing.find(trace => trace.node_id === nodeParentId) // the iteration node

                if (iterations && iterations.details) {
                  const iterRunID = data.execution_metadata?.parallel_mode_run_id

                  const currIteration = iterParallelLogMap.get(iterations.node_id)?.get(iterRunID)
                  const nodeIndex = currIteration?.findIndex(node =>
                    node.node_id === data.node_id && (
                      node?.parallel_run_id === data.execution_metadata?.parallel_mode_run_id),
                  )
                  if (currIteration) {
                    if (nodeIndex !== undefined && nodeIndex !== -1) {
                      currIteration[nodeIndex] = {
                        ...currIteration[nodeIndex],
                        ...data,
                      } as any
                    }
                    else {
                      currIteration.push({
                        ...data,
                      } as any)
                    }
                  }
                  setIterParallelLogMap(iterParallelLogMap)
                  const iterLogMap = iterParallelLogMap.get(iterations.node_id)
                  if (iterLogMap)
                    iterations.details = Array.from(iterLogMap.values())
                }
              }))
            }
          }
          else {
            setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
              const currentIndex = draft.tracing!.findIndex((trace) => {
                if (!trace.execution_metadata?.parallel_id)
                  return trace.node_id === data.node_id
                return trace.node_id === data.node_id && trace.execution_metadata?.parallel_id === data.execution_metadata?.parallel_id
              })
              if (currentIndex > -1 && draft.tracing) {
                draft.tracing[currentIndex] = {
                  ...(draft.tracing[currentIndex].extras
                    ? { extras: draft.tracing[currentIndex].extras }
                    : {}),
                  ...data,
                } as any
              }
            }))
            const newNodes = produce(nodes, (draft) => {
              const currentNode = draft.find(node => node.id === data.node_id)!
              currentNode.data._runningStatus = data.status as any
              if (data.status === NodeRunningStatus.Exception) {
                if (data.execution_metadata.error_strategy === ErrorHandleTypeEnum.failBranch)
                  currentNode.data._runningBranchId = ErrorHandleTypeEnum.failBranch
              }
              else {
                if (data.node_type === BlockEnum.IfElse)
                  currentNode.data._runningBranchId = data?.outputs?.selected_case_id

                if (data.node_type === BlockEnum.QuestionClassifier)
                  currentNode.data._runningBranchId = data?.outputs?.class_id
              }
            })
            setNodes(newNodes)
            const newEdges = produce(edges, (draft) => {
              const incomeEdges = draft.filter((edge) => {
                return edge.target === data.node_id
              })
              incomeEdges.forEach((edge) => {
                edge.data = {
                  ...edge.data,
                  _targetRunningStatus: data.status as any,
                }
              })
            })
            setEdges(newEdges)
            prevNodeId = data.node_id
          }

          if (onNodeFinished)
            onNodeFinished(params)
        },
        onIterationStart: (params) => {
          const { data } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
            setIterTimes,
          } = workflowStore.getState()
          const {
            getNodes,
            setNodes,
            edges,
            setEdges,
            transform,
          } = store.getState()
          const nodes = getNodes()
          setIterTimes(DEFAULT_ITER_TIMES)
          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            draft.tracing!.push({
              ...data,
              status: NodeRunningStatus.Running,
              details: [],
              iterDurationMap: {},
            } as any)
          }))

          const {
            setViewport,
          } = reactflow
          const currentNodeIndex = nodes.findIndex(node => node.id === data.node_id)
          const currentNode = nodes[currentNodeIndex]
          const position = currentNode.position
          const zoom = transform[2]

          if (!currentNode.parentId) {
            setViewport({
              x: (clientWidth - 400 - currentNode.width! * zoom) / 2 - position.x * zoom,
              y: (clientHeight - currentNode.height! * zoom) / 2 - position.y * zoom,
              zoom: transform[2],
            })
          }
          const newNodes = produce(nodes, (draft) => {
            draft[currentNodeIndex].data._runningStatus = NodeRunningStatus.Running
            draft[currentNodeIndex].data._iterationLength = data.metadata.iterator_length
            draft[currentNodeIndex].data._waitingRun = false
          })
          setNodes(newNodes)
          const newEdges = produce(edges, (draft) => {
            const incomeEdges = draft.filter(edge => edge.target === data.node_id)

            incomeEdges.forEach((edge) => {
              edge.data = {
                ...edge.data,
                _sourceRunningStatus: nodes.find(node => node.id === edge.source)!.data._runningStatus,
                _targetRunningStatus: NodeRunningStatus.Running,
                _waitingRun: false,
              }
            })
          })
          setEdges(newEdges)

          if (onIterationStart)
            onIterationStart(params)
        },
        onIterationNext: (params) => {
          const {
            workflowRunningData,
            setWorkflowRunningData,
            iterTimes,
            setIterTimes,
          } = workflowStore.getState()

          const { data } = params
          const {
            getNodes,
            setNodes,
          } = store.getState()

          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            const iteration = draft.tracing!.find(trace => trace.node_id === data.node_id)
            if (iteration) {
              if (iteration.iterDurationMap && data.duration)
                iteration.iterDurationMap[data.parallel_mode_run_id ?? `${data.index - 1}`] = data.duration
              if (iteration.details!.length >= iteration.metadata.iterator_length!)
                return
            }
            if (!data.parallel_mode_run_id)
              iteration?.details!.push([])
          }))
          const nodes = getNodes()
          const newNodes = produce(nodes, (draft) => {
            const currentNode = draft.find(node => node.id === data.node_id)!
            currentNode.data._iterationIndex = iterTimes
            setIterTimes(iterTimes + 1)
          })
          setNodes(newNodes)

          if (onIterationNext)
            onIterationNext(params)
        },
        onIterationFinish: (params) => {
          const { data } = params

          const {
            workflowRunningData,
            setWorkflowRunningData,
            setIterTimes,
          } = workflowStore.getState()
          const {
            getNodes,
            setNodes,
          } = store.getState()
          const nodes = getNodes()
          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            const tracing = draft.tracing!
            const currIterationNode = tracing.find(trace => trace.node_id === data.node_id)
            if (currIterationNode) {
              Object.assign(currIterationNode, {
                ...data,
                status: NodeRunningStatus.Succeeded,
              })
            }
          }))
          setIterTimes(DEFAULT_ITER_TIMES)
          const newNodes = produce(nodes, (draft) => {
            const currentNode = draft.find(node => node.id === data.node_id)!

            currentNode.data._runningStatus = data.status
          })
          setNodes(newNodes)

          prevNodeId = data.node_id

          if (onIterationFinish)
            onIterationFinish(params)
        },
        onParallelBranchStarted: (params) => {
          // console.log(params, 'parallel start')
        },
        onParallelBranchFinished: (params) => {
          // console.log(params, 'finished')
        },
        onTextChunk: (params) => {
          const { data: { text } } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
          } = workflowStore.getState()
          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            draft.resultTabActive = true
            draft.resultText += text
          }))
        },
        onTextReplace: (params) => {
          const { data: { text } } = params
          const {
            workflowRunningData,
            setWorkflowRunningData,
          } = workflowStore.getState()
          setWorkflowRunningData(produce(workflowRunningData!, (draft) => {
            draft.resultText = text
          }))
        },
        onTTSChunk: (messageId: string, audio: string, audioType?: string) => {
          if (!audio || audio === '')
            return
          player.playAudioWithAudio(audio, true)
          AudioPlayerManager.getInstance().resetMsgId(messageId)
        },
        onTTSEnd: (messageId: string, audio: string, audioType?: string) => {
          player.playAudioWithAudio(audio, false)
        },
        ...restCallback,
      },
    )
  }, [store, reactflow, workflowStore, doSyncWorkflowDraft])

  const handleStopRun = useCallback((taskId: string) => {
    const appId = useAppStore.getState().appDetail?.id

    stopWorkflowRun(`/apps/${appId}/workflow-runs/tasks/${taskId}/stop`)
  }, [])

  const handleRestoreFromPublishedWorkflow = useCallback(async () => {
    const appDetail = useAppStore.getState().appDetail
    const publishedWorkflow = await fetchPublishedWorkflow(`/apps/${appDetail?.id}/workflows/publish`)

    if (publishedWorkflow) {
      const nodes = publishedWorkflow.graph.nodes
      const edges = publishedWorkflow.graph.edges
      const viewport = publishedWorkflow.graph.viewport!

      handleUpdateWorkflowCanvas({
        nodes,
        edges,
        viewport,
      })
      featuresStore?.setState({ features: publishedWorkflow.features })
      workflowStore.getState().setPublishedAt(publishedWorkflow.created_at)
      workflowStore.getState().setEnvironmentVariables(publishedWorkflow.environment_variables || [])
    }
  }, [featuresStore, handleUpdateWorkflowCanvas, workflowStore])

  return {
    handleBackupDraft,
    handleLoadBackupDraft,
    handleRun,
    handleStopRun,
    handleRestoreFromPublishedWorkflow,
  }
}
