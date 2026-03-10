#!/usr/bin/env python3
"""
PodReader 可视化公众号排版器启动脚本。

使用方式：
    python scripts/serve_editor.py

默认在本机启动一个静态 HTTP 服务，并打开：
    http://127.0.0.1:8765/editor/
"""

from __future__ import annotations

import argparse
import contextlib
import socket
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def find_available_port(preferred: int) -> int:
    with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind(("127.0.0.1", preferred))
            return preferred
        except OSError:
            sock.bind(("127.0.0.1", 0))
            return int(sock.getsockname()[1])


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory: str, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description="PodReader 可视化公众号排版器启动器")
    parser.add_argument("--host", default="127.0.0.1", help="监听地址，默认 127.0.0.1")
    parser.add_argument("--port", type=int, default=8765, help="监听端口，默认 8765")
    parser.add_argument("--no-open", action="store_true", help="启动后不自动打开浏览器")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[1]
    port = find_available_port(args.port)
    editor_url = f"http://{args.host}:{port}/editor/"

    server = ThreadingHTTPServer(
        (args.host, port),
        lambda *handler_args, **handler_kwargs: NoCacheHandler(
            *handler_args,
            directory=str(project_root),
            **handler_kwargs,
        ),
    )

    print(f"PodReader WeChat Studio 已启动: {editor_url}")
    print("按 Ctrl+C 停止服务。")

    if not args.no_open:
        webbrowser.open(editor_url)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止。")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
