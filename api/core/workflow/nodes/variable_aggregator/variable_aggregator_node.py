from collections.abc import Mapping, Sequence
from typing import Any, cast

from core.workflow.entities.node_entities import NodeRunResult, NodeType
from core.workflow.nodes.base_node import BaseNode
from core.workflow.nodes.variable_aggregator.entities import VariableAssignerNodeData
from models.workflow import WorkflowNodeExecutionStatus


class VariableAggregatorNode(BaseNode):
    _node_data_cls = VariableAssignerNodeData
    _node_type = NodeType.VARIABLE_AGGREGATOR

    def _run(self) -> NodeRunResult:
        node_data = cast(VariableAssignerNodeData, self.node_data)
        # Get variables
        outputs = {}
        inputs = {}

        if (
            not node_data.advanced_settings
            or not node_data.advanced_settings.group_enabled
        ):
            for selector in node_data.variables:
                variable = self.graph_runtime_state.variable_pool.get_any(selector)
                if variable is not None:
                    outputs = {"output": variable}

                    inputs = {".".join(selector[1:]): variable}
                    break
        else:
            for group in node_data.advanced_settings.groups:
                for selector in group.variables:
                    variable = self.graph_runtime_state.variable_pool.get_any(selector)

                    if variable is not None:
                        outputs[group.group_name] = {"output": variable}
                        inputs[".".join(selector[1:])] = variable
                        break

        return NodeRunResult(
            status=WorkflowNodeExecutionStatus.SUCCEEDED, outputs=outputs, inputs=inputs
        )

    @classmethod
    def _extract_variable_selector_to_variable_mapping(
        cls,
        graph_config: Mapping[str, Any],
        node_id: str,
        node_data: VariableAssignerNodeData,
    ) -> Mapping[str, Sequence[str]]:
        """
        Extract variable selector to variable mapping
        :param graph_config: graph config
        :param node_id: node id
        :param node_data: node data
        :return:
        """
        return {}
