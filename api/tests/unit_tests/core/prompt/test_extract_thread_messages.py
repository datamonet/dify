from uuid import uuid4

from constants import UUID_NIL
from core.prompt.utils.extract_thread_messages import extract_thread_messages


class TestMessage:
    def __init__(self, id, parent_message_id):
        self.id = id
        self.parent_message_id = parent_message_id

    def __getitem__(self, item):
        return getattr(self, item)


def test_extract_thread_messages_single_message():
    messages = [TestMessage(str(uuid4()), UUID_NIL)]
    result = extract_thread_messages(messages)
    assert len(result) == 1
    assert result[0] == messages[0]


def test_extract_thread_messages_linear_thread():
    id1, id2, id3, id4, id5 = (
        str(uuid4()),
        str(uuid4()),
        str(uuid4()),
        str(uuid4()),
        str(uuid4()),
    )
    messages = [
        TestMessage(id5, id4),
        TestMessage(id4, id3),
        TestMessage(id3, id2),
        TestMessage(id2, id1),
        TestMessage(id1, UUID_NIL),
    ]
    result = extract_thread_messages(messages)
    assert len(result) == 5
    assert [msg["id"] for msg in result] == [id5, id4, id3, id2, id1]


def test_extract_thread_messages_branched_thread():
    id1, id2, id3, id4 = str(uuid4()), str(uuid4()), str(uuid4()), str(uuid4())
    messages = [
        TestMessage(id4, id2),
        TestMessage(id3, id2),
        TestMessage(id2, id1),
        TestMessage(id1, UUID_NIL),
    ]
    result = extract_thread_messages(messages)
    assert len(result) == 3
    assert [msg["id"] for msg in result] == [id4, id2, id1]


def test_extract_thread_messages_empty_list():
    messages = []
    result = extract_thread_messages(messages)
    assert len(result) == 0


def test_extract_thread_messages_partially_loaded():
    id0, id1, id2, id3 = str(uuid4()), str(uuid4()), str(uuid4()), str(uuid4())
    messages = [
        TestMessage(id3, id2),
        TestMessage(id2, id1),
        TestMessage(id1, id0),
    ]
    result = extract_thread_messages(messages)
    assert len(result) == 3
    assert [msg["id"] for msg in result] == [id3, id2, id1]


def test_extract_thread_messages_legacy_messages():
    id1, id2, id3 = str(uuid4()), str(uuid4()), str(uuid4())
    messages = [
        TestMessage(id3, UUID_NIL),
        TestMessage(id2, UUID_NIL),
        TestMessage(id1, UUID_NIL),
    ]
    result = extract_thread_messages(messages)
    assert len(result) == 3
    assert [msg["id"] for msg in result] == [id3, id2, id1]


def test_extract_thread_messages_mixed_with_legacy_messages():
    id1, id2, id3, id4, id5 = (
        str(uuid4()),
        str(uuid4()),
        str(uuid4()),
        str(uuid4()),
        str(uuid4()),
    )
    messages = [
        TestMessage(id5, id4),
        TestMessage(id4, id2),
        TestMessage(id3, id2),
        TestMessage(id2, UUID_NIL),
        TestMessage(id1, UUID_NIL),
    ]
    result = extract_thread_messages(messages)
    assert len(result) == 4
    assert [msg["id"] for msg in result] == [id5, id4, id2, id1]