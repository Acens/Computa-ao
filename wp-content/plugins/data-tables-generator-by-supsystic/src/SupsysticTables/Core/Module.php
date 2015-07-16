<?php


class SupsysticTables_Core_Module extends SupsysticTables_Core_BaseModule
{
    /**
     * @var SupsysticTables_Core_ModelsFactory
     */
    protected $modelsFactory;

    /**
     * {@inheritdoc}
     */
    public function onInit()
    {
        parent::onInit();

        $this->registerAjaxRequestHandler();
        $this->update();

        add_action('admin_menu', array($this, 'removeDefaultSubMenu'), 999);
    }

    /**
     * {@inheritdoc}
     */
    public function afterUiLoaded(SupsysticTables_Ui_Module $ui)
    {
        parent::afterUiLoaded($ui);

        $environment = $this->getEnvironment();
        $cachingAllowed = $environment->isProd();
        $pluginVersion = $environment->getConfig()->get('plugin_version');
        $hookName = 'admin_enqueue_scripts';

        $jquery = $ui->createScript('jquery')
            ->setHookName($hookName);

        /* jQuery */
        $ui->add($jquery);

        /* Core script with common functions in supsystic.Tables namespace */
        $ui->add(
            $ui->createScript('tables-core')
                ->setHookName(is_admin() ? $hookName : 'wp_enqueue_scripts')
                ->setModuleSource($this, 'js/core.js')
                ->addDependency($jquery)
                ->setCachingAllowed($cachingAllowed)
                ->setVersion($pluginVersion)
        );

        /* Bootstrap */
        $ui->add(
            $ui->createScript('tables-bootstrap')
                ->setHookName($hookName)
                ->setLocalSource('js/libraries/bootstrap/bootstrap.min.js')
                ->addDependency($jquery)
                ->setCachingAllowed(true)
                ->setVersion('3.3.1')
        );

        /* Chosen */
        $ui->add(
            $ui->createScript('tables-chosen')
                ->setHookName($hookName)
                ->setLocalSource('js/plugins/chosen.jquery.min.js')
                ->addDependency($jquery)
                ->setCachingAllowed(true)
                ->setVersion('1.4.2')
        );

        /* iCheck */
        $ui->add(
            $ui->createScript('tables-iCheck')
                ->setHookName($hookName)
                ->setLocalSource('js/plugins/icheck.min.js')
                ->addDependency($jquery)
                ->setCachingAllowed(true)
                ->setVersion('1.0.2')
        );

        /* Main UI script */
        $ui->add(
            $ui->createScript('tables-ui')
                ->setHookName($hookName)
                ->setLocalSource('js/supsystic.ui.js')
                ->addDependency($jquery)
                ->setCachingAllowed($cachingAllowed)
                ->setVersion($pluginVersion)
        );

        /* Main UI styles */
        $ui->add(
            $ui->createStyle('tables-ui-styles')
                ->setHookName($hookName)
                ->setLocalSource('css/supsystic-ui.css')
                ->setCachingAllowed($cachingAllowed)
                ->setVersion($pluginVersion)
        );
    }

    /**
     * Returns the models factory
     * @return SupsysticTables_Core_ModelsFactory
     */
    public function getModelsFactory()
    {
        if (!$this->modelsFactory) {
            $this->modelsFactory = new SupsysticTables_Core_ModelsFactory(
                $this->getEnvironment()
            );
        }

        return $this->modelsFactory;
    }

    public function removeDefaultSubMenu()
    {
        global $submenu;

//        if ($this->getEnvironment()->isPluginPage()) {
//            unset($submenu[$this->getEnvironment()->getMenu()->getMenuSlug()][0]);
//        }
    }

    /**
     * Handles the ajax requests and returns the response.
     * @return mixed
     */
    public function handleAjaxRequest()
    {
        $environment = $this->getEnvironment();
        $request = $this->getRequest();
        $route = $request->post->get('route');

        if (!array_key_exists('module', $route)) {
            wp_send_json_error(
                array(
                    'message' => $environment->translate(
                        'Invalid route specified: missing "module" key.'
                    )
                )
            );
        }

        $moduleName = $route['module'];
        $actionName = 'indexAction';

        if (array_key_exists('action', $route)) {
            $actionName = $route['action'] . 'Action';
        }

        $module = $environment->getModule($moduleName);
        if (!$module) {
            wp_send_json_error(
                array(
                    'message' => sprintf(
                        $environment->translate(
                            'You are requested to the non-existing module "%s".'
                        ),
                        $moduleName
                    )
                )
            );
        }

        if (!method_exists($module->getController(), $actionName)) {
            wp_send_json_error(
                array(
                    'message' => sprintf(
                        $environment->translate(
                            'You are requested to the non-existing route: %s::%s'
                        ),
                        $moduleName,
                        $actionName
                    )
                )
            );
        }

        $request->headers->add('X_REQUESTED_WITH', 'XMLHttpRequest');

        return call_user_func_array(
            array($module->getController(), $actionName),
            array($request)
        );
    }

    /**
     * Registers the ajax request handler
     */
    private function registerAjaxRequestHandler()
    {
        add_action(
            'wp_ajax_supsystic-tables',
            array($this, 'handleAjaxRequest')
        );
    }

    /**
     * Updates the plugin database if it is needed.
     */
    private function update()
    {
        $environment = $this->getEnvironment();
        $config = $environment->getConfig();

        $revision = array(
            'current' => (int)$config->get('revision'),
            'installed' => (int)get_option($config->get('revision_key'), -1)
        );

        if ($revision['current'] <= $revision['installed']) {
            return;
        }

        /** @var SupsysticTables_Core_Model_Core $core */
        $core = $this->getModelsFactory()->get('core');
        $updatesPath = $this->getLocation() . '/updates';

        for ($i = $revision['installed']; $i <= $revision['current']; $i++) {
            $file = $updatesPath . '/rev-'.$i.'.sql';

            if (!file_exists($file)) {
                continue;
            }

            try {
                $core->updateFromFile($file);
            } catch (Exception $e) {
                if (!$environment->isPluginPage()) {
                    return;
                }

                wp_die(
                    sprintf(
                        'Failed to update plugin database. Reason: %s',
                        $e->getMessage()
                    )
                );
            }
        }

        update_option($config->get('revision_key'), $revision['current']);
    }
}