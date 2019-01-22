class BroadcastCenter {
    private listeners: Array<{ key: string, handler: (data: any) => void }> = [];
    private id = "";
    constructor() {
        if (chrome && chrome.runtime) {
            if (chrome.runtime.onMessage) {
                chrome.runtime.onMessage.addListener((request, sender, callback) => {
                    const { key, data } = request;
                    this.listeners.filter((it) => it.key === key).forEach((it) => it.handler(data));
                    if (document && document.dispatchEvent) {
                        document.dispatchEvent(new CustomEvent("BroadcastCenter", {
                            detail: {
                                data,
                                key,
                            },
                        }));
                    }
                });
            }
            if (chrome.runtime.onMessageExternal) {
                chrome.runtime.onMessageExternal.addListener((request, sender, callback) => {
                    const { key, data } = request;
                    this.listeners.filter((it) => it.key === key).forEach((it) => it.handler(data));
                });
            }
        }
        if (document && document.addEventListener) {
            document.addEventListener("BroadcastCenter", (event: any) => {
                const { key, data } = event.detail;
                this.listeners.filter((it) => it.key === key).forEach((it) => it.handler(data));
            });
        }
        if (chrome && chrome.runtime && chrome.runtime.id) {
            this.on("require_extension_id", () => {
                this.send("provice_extension_id", chrome.runtime.id);
                return true;
            });
        }
        if (!chrome || !chrome.runtime || !chrome.runtime.id) {
            this.on<string>("provice_extension_id", (data) => {
                this.id = data;
                return true;
            });
            this.send("require_extension_id", null);
        }
    }

    public on<T>(key: string, handler: (data: T) => void) {
        this.listeners.push({
            handler,
            key,
        });
    }

    public send<T>(key: string, data: T) {
        if (chrome && chrome.runtime) {
            if (chrome.runtime.sendMessage) {
                try {
                    chrome.runtime.sendMessage({
                        data,
                        key,
                    });
                } catch (error) {
                    if (this.id) {
                        chrome.runtime.sendMessage(this.id, {
                            data,
                            key,
                        });
                    }
                }
            }
        }
        if (document && document.dispatchEvent) {
            document.dispatchEvent(new CustomEvent("BroadcastCenter", {
                detail: {
                    data,
                    key,
                },
            }));
        }
        if (chrome && chrome.tabs) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
                const currentTab = tab[0];
                if (currentTab.id) {
                    chrome.tabs.sendMessage(currentTab.id, {
                        data,
                        key,
                    });
                }
            });
        }
    }
}

const Broadcast = new BroadcastCenter();

export default Broadcast;
