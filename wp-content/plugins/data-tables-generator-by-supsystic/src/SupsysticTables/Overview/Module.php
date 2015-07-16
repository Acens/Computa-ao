<?php

/**
 * Class SupsysticTables_Overview_Module
 */
class SupsysticTables_Overview_Module extends SupsysticTables_Core_BaseModule
{
    public function onInit()
    {
        parent::onInit();

        $this->registerMenu();

        $config = $this->getEnvironment()->getConfig();
        $config->add('post_url', 'http://supsystic.com/news/main.html');
        $config->add('mail', 'support@supsystic.team.zendesk.com');
    }


    /**
     * {@inheritdoc}
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
        parent::afterUiLoaded($ui);

        if (!$this->getEnvironment()->isModule('overview')) {
            return;
        }

        $hook = 'admin_enqueue_scripts';
        $ui->add(
            $ui->createStyle('supsystic-tables-overview-css')->setHookName(
                $hook
            )->setModuleSource($this, 'css/overview.css')
        );

        $ui->add(
            $ui->createScript('supsystic-tables-overview-js')->setHookName(
                $hook
            )->setModuleSource($this, 'js/overview.settings.js')
        );

        $ui->add(
            $ui->createScript('supsystic-tables-overview-scroll-js')->setHookName(
                $hook
            )->setModuleSource($this, 'js/jquery.slimscroll.js')
        );
    }

    private function registerMenu()
    {
        $environment = $this->getEnvironment();
        $menu = $environment->getMenu();
        $submenu = $menu->createSubmenuItem();

        $submenu->setCapability('manage_options')
            ->setMenuSlug($menu->getMenuSlug() . '&module=' . $this->getModuleName())
            ->setMenuTitle($environment->translate('Overview'))
            ->setPageTitle($environment->translate('Overview'))
            ->setModuleName('overview');

        $menu->addSubmenuItem('overview', $submenu)
            ->register();
    }
}