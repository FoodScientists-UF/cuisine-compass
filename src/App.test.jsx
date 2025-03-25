import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PageWrapper from './components/PageWrapper';
import MenuBar from './layouts/MenuBar';
import Explore from './pages/Explore';
import Following from './pages/Following';
import About from './pages/About';
import { AuthProvider } from './AuthProvider';

describe('Routing', () => {

    it('should render MenuBar when navigating to root', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <PageWrapper>
                    <MenuBar />
                </PageWrapper>
            </MemoryRouter>
        );
        expect(screen.getByText(/Explore/i)).toBeInTheDocument();
        expect(screen.getByText(/Following/i)).toBeInTheDocument();
        expect(screen.getByText(/About/i)).toBeInTheDocument();
    });

    it('should render Explore page on / route', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={
                            <PageWrapper>
                                <MenuBar />
                            </PageWrapper>
                        }>
                            <Route index element={<Explore />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );
        // Look for the Explore content or its link
        expect(screen.getByText(/Explore/i)).toBeInTheDocument();
    });

    it('should render Following page on /following route', () => {
        render(
            <MemoryRouter initialEntries={['/following']}>
                <Routes>
                    <Route path="/" element={
                        <PageWrapper>
                            <MenuBar />
                        </PageWrapper>
                    }>
                        <Route path="following" element={<Following />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getAllByText(/Following/i).length).toBeGreaterThan(0);
    });

    it('should render About page on /about route', () => {
        render(
            <MemoryRouter initialEntries={['/about']}>
                <Routes>
                    <Route path="/" element={
                        <PageWrapper>
                            <MenuBar />
                        </PageWrapper>
                    }>
                        <Route path="about" element={<About />} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );
        expect(screen.getByText(/About/i)).toBeInTheDocument();
    });
});