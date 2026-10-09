# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-08

### Added
- **Domain-Driven Design (DDD) Architecture:**
  - Layered directory structure separating Domain, Application, Infrastructure, and Presentation concerns inside each bounded context.
  - Nine bounded contexts plus a Shared context: Identity & Access, Customer Management, Service Catalog, Order Management, Laundry Operations, Payments, Tracking & Notifications, Pickups & Deliveries, and Dashboard.
- **Shared Bounded Context:**
  - Domain model base classes: `AggregateRoot`, `DomainEvent`, `Repository`, `Money`, and `Currency` value objects, `ValidationError`, `NotFoundError`, UUID v7 helpers (`generateUuid`, `validateUuid`), and a stable `mergeSort` utility.
  - Reusable HTTP client `BaseApi`, CRUD abstraction `BaseEndpoint` using Axios, and `BaseRepository` implementation.
  - Application layout with sidebar menu (drawer on small screens), top bar with page title and breadcrumb, and header search bar shared by the boards (`useBoardSearch`, accent-insensitive and ranked by relevance).
  - Shared views for `Home`, `About`, and `PageNotFound` (404), reusable `LanguageSwitcher` component, and shared board styles (`board.css`).
- **Identity & Access Bounded Context:**
  - Domain layer: `User` entity and `UserRepository`.
  - Application layer: `IdentityService` and `AuthenticationService`.
  - Infrastructure layer: `AuthenticationApi`, `AuthenticationServiceImpl`, `UserAssembler`, and `UserRepositoryImpl`.
  - Presentation layer: `AuthenticationController`, `useAuthenticationStore` Pinia store, `LoginView` and `RegisterView` (routes `/login` and `/register`).
- **Customer Management Bounded Context:**
  - Domain layer: `Customer` entity and `DocumentType` (`DNI`, `CE`) with document length validation.
  - Application layer: `useCustomersStore` Pinia store.
  - Infrastructure layer: `CustomersApi` and `CustomerAssembler`.
  - Presentation layer: `CustomerList` view, `CustomerCreateDialog`, and route `/customers`.
- **Service Catalog Bounded Context:**
  - Domain layer: `LaundryService`, `Garment`, and `CatalogItem` entities, and `DemandPeriod` to compute the most requested items (last hour, 24 hours, 7 days, and 30 days).
  - Application layer: `useServiceCatalogStore` Pinia store.
  - Infrastructure layer: `ServiceCatalogApi` and `CatalogAssembler`.
  - Presentation layer: `ServiceList` and `GarmentList` views, `CatalogPage`, `CatalogItemDialog`, and `DemandChart` components, and routes `/services` and `/garments`.
- **Order Management Bounded Context:**
  - Domain layer: `Order` aggregate, `GarmentItem`, and `Customer` reference entities; `OrderStatus`, `ServiceType`, and `DeliveryMethod` enumerations; `OrderRepository` and `CustomerRepository` contracts.
  - Application layer: `OrderService` and `useOrderStore` Pinia store.
  - Infrastructure layer: `OrderRepositoryImpl`, `CustomerRepositoryImpl`, `OrderAssembler`, and `CustomerAssembler`.
  - Presentation layer: `OrderController`, `OrderList` view, `OrderCreateDialog`, and route `/orders`.
- **Laundry Operations Bounded Context:**
  - Domain layer: `LaundryOrder` aggregate root (six processing stages, `NORMAL` and `VIP` priority, delivery risk detection), `WashingCycle` entity, `LaundryResource` aggregate root, and `ProcessingStage`, `Priority`, and `ResourceStatus` enumerations.
  - Application layer: `useLaundryOperationStore` (receive, classify, assign washing cycle and resource, advance stage, and prioritize orders) and `useResourceStore` (available resources, reservation, release, and status synchronization).
  - Infrastructure layer: `LaundryOperationsApi`, `LaundryOrderAssembler`, `WashingCycleAssembler`, `LaundryResourceAssembler`, `IoTGatewayApi`, `SensorTelemetryPayload`, and `ResourceMonitoringACL` (anti-corruption layer that translates raw sensor status codes into `ResourceStatus`).
  - Presentation layer: `ProductionBoard`, `LaundryResourceList`, and `WashingCycleList` views; `LaundryDashboard`, `LaundryOrderCard`, `AssignOrderDialog`, `LaundryOperationsSummary`, and `LaundryOperationsMenu` components; routes under `/laundry-operations`.
- **Payments Bounded Context:**
  - Domain layer: `Payment` entity and `PaymentStatus` (`paid`, `pending`, `cancelled`).
  - Application layer: `usePaymentsStore` Pinia store.
  - Infrastructure layer: `PaymentsApi` and `PaymentAssembler`.
  - Presentation layer: `PaymentCatalog` view with Yape QR code (`public/yape-qr.png`) and route `/payments`.
- **Tracking & Notifications Bounded Context:**
  - Domain layer: `OrderTracking` and `Notification` entities.
  - Application layer: `useTrackingNotificationStore` Pinia store.
  - Infrastructure layer: `TrackingNotificationApi`, `TrackingAssembler`, and `NotificationAssembler`.
  - Presentation layer: `OrderTrackingList` and `OrderTrackerView` views; `TrackingList`, `TrackingSummary`, `TrackingHistory`, `StageStepper`, and `StageTag` components; `NotificationToaster` with configurable polling interval and toast lifetime; routes under `/tracking-notifications`.
- **Pickups & Deliveries Bounded Context:**
  - Domain layer: `Delivery` entity.
  - Application layer: `usePickupsDeliveriesStore` Pinia store.
  - Infrastructure layer: `PickupsDeliveriesApi` and `DeliveryAssembler`.
  - Presentation layer: `DeliveryList` view, `DeliveryCatalog` component, and route `/pickups-deliveries/deliveries`.
- **Dashboard Bounded Context:**
  - Domain layer: `DashboardMetrics` calculations (summary, orders per day, revenue per day, top services, and status distribution).
  - Application layer: `useDashboardStore` Pinia store.
  - Infrastructure layer: `DashboardApi`.
  - Presentation layer: `DashboardView` (route `/home`) with `BarChart`, `LineChart`, `DonutChart`, and `RankingBars` components.
- **Internationalization (i18n):**
  - Integrated `vue-i18n` with English (`en`) and Spanish (`es`) translation catalogs.
- **UI Framework & Styling:**
  - Integrated PrimeVue with a custom WashTrack preset theme, PrimeFlex grid system, and PrimeIcons.
  - WashTrack design tokens (colors and typography) in `washtrack-theme.css`.
  - Toast, Confirmation, and Dialog service plugins.
- **Routing & State Management:**
  - Vue Router single-page navigation with lazy-loaded route components and page titles from i18n.
  - Pinia store root initialization.
- **Mock Server & Configuration:**
  - `json-server` local mock backend with mock database (`server/db.json`), route rewrite rules (`server/routes.json`), and `npm run server` script.
  - Environment variables for development and production (`.env.development` and `.env.production`): API base URL, endpoint paths of each bounded context, IoT gateway, notifications polling, and Prime UI license key.
- **Documentation & Licensing:**
  - `README.md` with architecture overview, instructions to add a bounded context, running guide, and Git workflow.
  - `LICENSE.md` (MIT License).
