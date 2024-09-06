

export class PortManager {
    private static serviceToPort: Map<string, number> = new Map<string, number>(
        [
            ['flight-gateway', 3000],
            ['notification-center', 3001],
            ['order-orchestrator', 3002],
            ['order-service', 3003],
            ['payment-manager', 3004],
            ['search-engine', 3005],
            ]
    );

    public static getPort(service: string): number {
        return this.serviceToPort.get(service) || 2999;
    }
}