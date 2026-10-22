declare module '@yandex/ymaps3-types/import' {
    interface Import {
        (pkg: '%PACKAGE_NAME%'): Promise<typeof import('./index')>;
    }
}

export {};
